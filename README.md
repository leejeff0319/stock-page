# All-in-One Financial App

## Goals
We’ve all been there. Checking our bank account, only to freeze in disbelief at the balance. "There’s no way I spent that much!" But then comes the slow, sinking realization as we scroll through the transactions: every coffee, every impulse buy, every "It’s just a few dollars" adds up. And just like that, another paycheck slips through our fingers, pushing us further from the financial stability we’re working so hard to reach. This app will not only help us cut down on our spending, but it will also help us make better choices.

We developed our app to alert users about how much impact their spending habits have on their financial state. The app has a banking page that shows users the current balance of their bank account and recent purchases. The backtest page will allow users
to test out their trading strategies to find the best one. If users want to do their own research in hopes of cracking the code, the statistics page allows users to insert their own dataset to build a machine learning model.

## Authentication

<img width="1918" height="409" alt="Image" src="https://github.com/user-attachments/assets/1a262f26-3e9a-4803-aad5-950dba87318d" />
<img width="1636" height="625" alt="Image" src="https://github.com/user-attachments/assets/5cc8fefb-677b-4ea8-b11a-345f11338ad9" />

We built user authentication through Supabase. Features of the website will be inaccessible before the user logs into their account. A user will be taken to the Dashboard page and have access to the rest of the website after signing up and confirming their email. 

## Dashboard

<img width="2240" height="971" alt="Dashboard" src="https://github.com/user-attachments/assets/b98e05d5-a741-4f13-a5cb-2dfa27c77170" />


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

## Banking

User can connect their bank accounts using Plaid API. Simply click on the "Connect Bank" button in the middle of the page.
<img width="450" height="510" alt="Banking Page" src="https://github.com/user-attachments/assets/a24f2b3b-847a-4091-b0ed-075d8fe70851" />

Then follow the prompts shown on the popup by Plaid to get connected.

<img width="450" height="500" alt="ConnectBank4" src="https://github.com/user-attachments/assets/07e6537a-4ae5-46d5-916f-67842edef1a5" />
<img width="450" height="500" alt="ConnectBank3" src="https://github.com/user-attachments/assets/770f0ec8-c130-445d-86d0-c80358871442" />
<img width="450" height="500" alt="ConnectBank2" src="https://github.com/user-attachments/assets/2d659a74-55d9-4786-a79c-45186de341e5" />
<img width="450" height="500" alt="ConnectBank" src="https://github.com/user-attachments/assets/3821eaaa-7867-40cb-a5a4-b6e348e943e2" />

Page shows a summary of User's bank accounts, including total Net Worth and Recent Transactions of all bank accounts combined. 

<img width="900" height="450" alt="ConnectBank5" src="https://github.com/user-attachments/assets/2925f308-d784-473b-9e18-5a14ca6d58af" />

Here is an image of all of the Plaid logs from this interaction.

<img width="500" height="500" alt="PlaidLogs" src="https://github.com/user-attachments/assets/8d2c7cdc-e2bb-4f7b-bb58-fc74fd194a97" />

## Backtest

User can use this page to perform a simple backtest for a stock trading strategy. Alpaca Trading API is used, purchase/sell are decided by results of a Sentiment Analysis of Yahoo Finance News articles. FinBERT gives a result of whether each day had an overall positive sentiment of negative sentiment on the SPY stock. Then, based on the risk chosen by the user, trade is executed. Results pop up on a separate web browser tab as shown below. 

<img width="942" height="479" alt="Backtest" src="https://github.com/user-attachments/assets/4dbcdc6a-dd68-4b6f-96f8-fad930b2a291" />

<img width="2513" height="1196" alt="BacktestResult" src="https://github.com/user-attachments/assets/1fce9fae-67c6-41ea-844f-722444ed2071" />
