import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import io
import numpy as np

class Fruit(BaseModel):
    name: str

class Fruits(BaseModel):
    fruits: List[Fruit]

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

        # Generate profile
        profile = generate_data_profile(df_clean)
        
        print("\n=== Original Shape ===")
        print(df.shape)
        print("\n=== Cleaned Shape ===")
        print(df_clean.shape)
        print("\n=== Sample Data ===")
        print(df_clean.head())
        
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