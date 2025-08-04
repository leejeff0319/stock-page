# All-in-One Website

## Goals


## Authentication

<img width="1918" height="409" alt="Image" src="https://github.com/user-attachments/assets/1a262f26-3e9a-4803-aad5-950dba87318d" />
<img width="1636" height="625" alt="Image" src="https://github.com/user-attachments/assets/5cc8fefb-677b-4ea8-b11a-345f11338ad9" />

We built user authentication through Supabase. Features of the website will be inaccessible before the user logs into their account. A user will be taken to the Dashboard page and have access to the rest of the website after signing up and confirming their email. 

## Dashboard

<img width="1916" height="562" alt="Image" src="https://github.com/user-attachments/assets/e2c2d70a-c7d8-49d7-8c8b-b0d3ad9126c6" />

## Statistics

<img width="450" height="370" alt="Image" src="https://github.com/user-attachments/assets/f7a5f7f9-fcc4-4207-b9de-8d79875e535c" />
<img width="450" height="300" alt="Image" src="https://github.com/user-attachments/assets/d457c68f-5ef2-4285-9b4d-0edfe6b6f831" />

The Statistics section of the website offers users a free automated machine learning pipeline model. Users are first invited to upload their dataset. After the dataset is uploaded, it will be cleaned and processed to return data profiling as well as a preview of the data
showing the first 5 rows.  

<img width="450" height="300" alt="image" src="https://github.com/user-attachments/assets/bcd178cc-57bc-41ad-8807-d6b585538090" />
<img width="450" height="220" alt="Image" src="https://github.com/user-attachments/assets/3a15a85b-675a-4dd7-8ac5-67fd87e140af" />

The data profiling section shows information about each attribute of the datasets. Textual information displaying the mean and range of the data is shown on top. And below the textual information, a visualization of the distribution is shown to enhance the user's 
knowledge of each attribute. 

<img width="904" height="340" alt="Image" src="https://github.com/user-attachments/assets/d406801b-7034-4728-b05b-7d5b71ebd975" />

A correlation analysis is shown at the bottom of the data profiling section, informing the users about the correlation of the attributes in the dataset.

<img width="949" height="355" alt="Image" src="https://github.com/user-attachments/assets/47d868b6-5468-4ea2-964e-3739ace3d41f" />

The user can then select a column to train the model to predict in a dropdown menu of attributes from the dataset. 

<img width="450" height="500" alt="Image" src="https://github.com/user-attachments/assets/e4515296-8f02-42ce-8193-be5c966e1731" />
<img width="450" height="300" alt="Image" src="https://github.com/user-attachments/assets/e0bbc20d-b3c8-4f57-9863-0a3a98edd53d" />

Categorical data will be trained through Random Forest, Logistic Regression, XGBoost, SVM, and Gradient Boosting methods, while continuous data is trained through Random Forest, XGBoost, and Gradient Boosting methods. Out of the trained models, a model with the highest 
accuracy will be presented for categorical data, while a model with the lowest MSE (Mean Squared Error) is presented for continuous data. Finally, the users can download the trained model by clicking on the "Download Model" button.
