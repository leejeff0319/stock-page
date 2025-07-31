import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from mlPipeline import MLPipeline

class Fruit(BaseModel):
    name: str

class Fruits(BaseModel):
    fruits: List[Fruit]

class TrainRequest(BaseModel):
    target_column: str
    test_size: float = 0.2
    random_state: int = 42

app = FastAPI()
ml_pipeline = MLPipeline()

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
    return await ml_pipeline.upload_dataset(file)

@app.post("/train-model")
async def train_model(request: TrainRequest):
    return await ml_pipeline.train_model(
        target_column=request.target_column,
        test_size=request.test_size,
        random_state=request.random_state
    )

@app.get("/download-model")
async def download_model():
    return await ml_pipeline.download_model()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)