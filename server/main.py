import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import io

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
        
        # Drop rows with any NaN values (keep complete cases only)
        df_clean = df.dropna()
        
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
            "sample_data": df_clean.head().to_dict(orient='records')
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)