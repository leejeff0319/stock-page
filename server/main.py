import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report, r2_score
import joblib
from pathlib import Path
import tempfile
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from xgboost import XGBClassifier, XGBRegressor
from fastapi.responses import FileResponse

class Fruit(BaseModel):
    name: str

class Fruits(BaseModel):
    fruits: List[Fruit]

class TrainRequest(BaseModel):
    target_column: str
    test_size: float = 0.2
    random_state: int = 42

class ModelInfo(BaseModel):
    model_type: str
    accuracy: Optional[float] = None
    mse: Optional[float] = None
    r2: Optional[float] = None
    feature_importance: Optional[dict] = None
    classification_report: Optional[dict] = None
    is_classification: Optional[bool] = None

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory_db = {"fruits": []}
current_model = None
current_model_info = None

@app.get("/fruits", response_model=Fruits)
def get_fruits():
    return Fruits(fruits=memory_db["fruits"])

@app.post("/fruits", response_model=Fruit)
def add_fruit(fruit: Fruit):
    memory_db["fruits"].append(fruit)
    return fruit

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        # Read file content
        content = await file.read()
        
        # Determine file type and read into DataFrame
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        else:
            raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")

        missing_values = ['.', ' ', 'NA', 'N/A', 'NaN', 'NULL', '?', '..']

        # Drop rows with any NaN values (keep complete cases only)
        df_clean = df.replace(missing_values, pd.NA).dropna()
        
        # Store the cleaned dataset in memory
        app.current_dataset = df_clean
        
        # Generate profile
        profile = generate_data_profile(df_clean)
        
        return {
            "message": "Dataset uploaded successfully",
            "filename": file.filename,
            "columns": df_clean.columns.tolist(),
            "original_row_count": len(df),
            "cleaned_row_count": len(df_clean),
            "shape": df_clean.shape,
            "sample_data": df_clean.head().to_dict(orient='records'),
            "profile": profile
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train-model")
async def train_model(request: TrainRequest):
    global current_model, current_model_info
    
    try:
        if not hasattr(app, 'current_dataset'):
            raise HTTPException(status_code=400, detail="No dataset uploaded. Please upload a dataset first.")
        
        df = app.current_dataset
        target_column = request.target_column
        
        if target_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{target_column}' not found in dataset.")
        
        # Prepare features and target
        X = df.drop(columns=[target_column])
        y = df[target_column]

        print("\n=== DATA DIAGNOSTICS ===")
        print("Target column sample values:", y.head().tolist())
        print("Target unique values:", y.nunique())
        print("Features dtypes:\n", X.dtypes)
        print("Missing values in features:\n", X.isna().sum())
        print("=======================\n")
        
        # Determine if classification or regression
        is_classification = (
            pd.api.types.is_categorical_dtype(y) or 
            pd.api.types.is_object_dtype(y) or 
            y.nunique() < 10
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=request.test_size, 
            random_state=request.random_state,
            stratify=y if is_classification else None
        )
        
        # Preprocessing pipeline (same as before)
        numeric_features = X.select_dtypes(include=['number']).columns.tolist()
        categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
        
        numeric_transformer = Pipeline(steps=[('scaler', StandardScaler())])
        categorical_transformer = Pipeline(steps=[('onehot', OneHotEncoder(handle_unknown='ignore'))])
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)
            ])
        
        # Define models to test
        if is_classification:
            models = {
                "RandomForest": RandomForestClassifier(random_state=42),
                "LogisticRegression": LogisticRegression(max_iter=1000),
                "XGBoost": XGBClassifier(random_state=42),
                "SVM": SVC(probability=True, random_state=42),
                "GradientBoosting": GradientBoostingClassifier(random_state=42)
            }
            
        else:
            models = {
                "RandomForest": RandomForestRegressor(random_state=42),
                "XGBoost": XGBRegressor(random_state=42),
                "GradientBoosting": GradientBoostingRegressor(random_state=42)
            }
        
        # Train and evaluate each model
        results = {}
        best_score = -float('inf') if is_classification else float('inf')
        best_model = None
        best_model_name = ""
        
        for name, model in models.items():
            try:
                pipeline = Pipeline([
                    ('preprocessor', preprocessor),
                    ('model', model)
                ])
                
                pipeline.fit(X_train, y_train)
                y_pred = pipeline.predict(X_test)
                
                if is_classification:
                    score = accuracy_score(y_test, y_pred)
                    print(f"{name} - Accuracy: {score:.4f}")
                    # Higher accuracy is better
                    if score > best_score:
                        best_score = score
                        best_model = pipeline
                        best_model_name = name
                else:
                    score = mean_squared_error(y_test, y_pred)
                    print(f"{name} - MSE: {score:.4f}")
                    # Lower MSE is better
                    if score < best_score:
                        best_score = score
                        best_model = pipeline
                        best_model_name = name
                
                results[name] = score
            except Exception as e:
                print(f"Error training {name}: {str(e)}")
                continue
        
        print(f"\n=== TRAINING RESULTS ===")
        print(f"Best model: {best_model_name}")
        print(f"Best score: {best_score}")
        print(f"All results: {results}")
        print("=======================\n")

        # Evaluate best model
        if best_model is None:
            raise HTTPException(status_code=500, detail="No model could be trained successfully.")
        
        y_pred = best_model.predict(X_test)
        
        # Prepare model info
        model_info = {
            "model_type": best_model_name,
            "is_classification": is_classification
        }
        
        if is_classification:
            model_info["accuracy"] = accuracy_score(y_test, y_pred)
            model_info["classification_report"] = classification_report(y_test, y_pred, output_dict=True)
        else:
            model_info["mse"] = mean_squared_error(y_test, y_pred)
            model_info["r2"] = r2_score(y_test, y_pred)
        
        # Get feature importance (if available)
        if hasattr(best_model.named_steps['model'], 'feature_importances_'):
            feature_importances = best_model.named_steps['model'].feature_importances_
            
            # Get feature names after preprocessing
            if len(categorical_features) > 0:
                ohe = best_model.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot']
                cat_feature_names = ohe.get_feature_names_out(categorical_features)
                all_feature_names = numeric_features + list(cat_feature_names)
            else:
                all_feature_names = numeric_features
            
            model_info["feature_importance"] = dict(zip(all_feature_names, feature_importances))
        
        current_model = best_model
        current_model_info = ModelInfo(**model_info)
        
        return {
            "message": f"Model training complete. Best model: {best_model_name}",
            "model_info": model_info,
            "all_model_results": results,
            "is_classification": is_classification
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download-model")
async def download_model():
    global current_model
    
    if current_model is None:
        raise HTTPException(status_code=404, detail="No trained model available")
    
    try:
        # Save model to a temporary file
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            joblib.dump(current_model, tmp.name)
            
            # Return the file
            return FileResponse(
                tmp.name,
                media_type='application/octet-stream',
                filename="trained_model.joblib"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_highly_correlated_pairs(corr_matrix, threshold=0.7):
    """Identify highly correlated variable pairs"""
    if corr_matrix is None:
        return None
    
    corr_pairs = corr_matrix.abs().stack()
    pairs = corr_pairs[corr_pairs > threshold].reset_index()
    pairs = pairs[pairs['level_0'] != pairs['level_1']]  # Remove diagonal
    
    if len(pairs) > 0:
        pairs.columns = ['variable1', 'variable2', 'correlation']
        return pairs.sort_values('correlation', ascending=False).to_dict('records')
    return None

def generate_data_profile(df: pd.DataFrame) -> dict:
    numeric_cols = df.select_dtypes(include=['number']).columns
    corr_matrix = df[numeric_cols].corr().round(2) if len(numeric_cols) > 1 else None

    profile = {
        "overview": {
            "rows": len(df),
            "columns": len(df.columns),
            "missing_values": int(df.isna().sum().sum()),
            "duplicate_rows": int(df.duplicated().sum())
        },
        "columns": {
            col: {
                "type": str(df[col].dtype),
                "missing": int(df[col].isna().sum()),
                "unique": int(df[col].nunique()),
                "stats": {
                    **({
                        "mean": float(df[col].mean()),
                        "min": float(df[col].min()),
                        "max": float(df[col].max()),
                        "std": float(df[col].std()),
                        "quantiles": {
                            "25%": float(df[col].quantile(0.25)),
                            "50%": float(df[col].quantile(0.50)),
                            "75%": float(df[col].quantile(0.75))
                        }
                    } if pd.api.types.is_numeric_dtype(df[col]) else {}),
                    **({
                        "value_counts": df[col].value_counts().head(10).to_dict(),
                        "top_values": df[col].value_counts().head(3).to_dict()
                    } if pd.api.types.is_string_dtype(df[col]) or 
                        pd.api.types.is_categorical_dtype(df[col]) else {})
                },
                "sample_values": df[col].dropna().head(3).tolist(),
                **({
                    "distribution": {
                        "bins": np.linspace(
                            int(df[col].min()), 
                            int(df[col].max()) + (0 if df[col].max().is_integer() else 1),
                            10, 
                            dtype=int
                        ).tolist(),
                        "counts": np.histogram(
                            df[col].dropna(),
                            bins=np.linspace(
                                int(df[col].min()),
                                int(df[col].max()) + (0 if df[col].max().is_integer() else 1),
                                10,
                                dtype=int
                            )
                        )[0].tolist()
                    }
                } if pd.api.types.is_numeric_dtype(df[col]) else {}),
                **({
                    "distribution": {
                        "categories": df[col].value_counts().head(10).index.tolist(),
                        "counts": df[col].value_counts().head(10).values.tolist()
                    }
                } if pd.api.types.is_string_dtype(df[col]) or 
                    pd.api.types.is_categorical_dtype(df[col]) else {})
            } for col in df.columns
        },
        "correlation": {
            "matrix": corr_matrix.to_dict() if corr_matrix is not None else None,
            "highly_correlated": get_highly_correlated_pairs(corr_matrix, threshold=0.7) 
                               if corr_matrix is not None else None
        }
    }
    return profile

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)