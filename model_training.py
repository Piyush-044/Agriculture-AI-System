import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os

def generate_synthetic_data(num_samples=2200):
    np.random.seed(42)
    crops = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 
             'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 
             'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 
             'coconut', 'cotton', 'jute', 'coffee']
    
    data = []
    
    # We will create slightly differentiated ranges for each crop to make the model learn
    for i in range(num_samples):
        crop = np.random.choice(crops)
        
        # Base stats
        n = np.random.randint(0, 140)
        p = np.random.randint(5, 145)
        k = np.random.randint(5, 205)
        temp = np.random.uniform(8.0, 45.0)
        humidity = np.random.uniform(14.0, 100.0)
        ph = np.random.uniform(3.5, 9.5)
        rainfall = np.random.uniform(20.0, 298.0)
        
        # Injecting some logical bias based on crops roughly
        if crop == 'rice':
            rainfall = np.random.uniform(150, 300)
            humidity = np.random.uniform(80, 100)
            n = np.random.randint(60, 100)
        elif crop == 'coffee':
            temp = np.random.uniform(15, 28)
            ph = np.random.uniform(6.0, 7.5)
        elif crop in ['watermelon', 'muskmelon']:
            temp = np.random.uniform(25, 40)
            humidity = np.random.uniform(85, 95)
        elif crop == 'apple':
            temp = np.random.uniform(10, 25)
            ph = np.random.uniform(5.5, 6.5)

        data.append([n, p, k, temp, humidity, ph, rainfall, crop])
        
    df = pd.DataFrame(data, columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label'])
    return df

if __name__ == "__main__":
    print("Generating synthetic agricultural dataset...")
    df = generate_synthetic_data(5000)
    
    # Optional: save to CSV if user wants to see it
    df.to_csv("synthetic_crop_data.csv", index=False)
    
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Model Accuracy (Synthetic Data): {acc * 100:.2f}%")
    
    print("Exporting model to random_forest_crop_model.pkl...")
    with open("random_forest_crop_model.pkl", "wb") as f:
        pickle.dump(model, f)
        
    print("Training complete!")
