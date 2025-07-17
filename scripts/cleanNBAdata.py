from nba_api.stats.endpoints import leaguedashplayerstats
import json
import os
from pathlib import Path
import pandas as pd

column_mapping = {
    # Player Info
    "PLAYER_ID": "ID",
    "PLAYER_NAME": "Player",
    "TEAM_ABBREVIATION": "Team",
    "AGE": "Age",
    
    # Game Stats
    "GP": "Games",
    "W": "Wins",
    "L": "Losses",
    "W_PCT": "Win %",
    "MIN": "Minutes",
    
    # Shooting
    "FGM": "FG Made",
    "FGA": "FG Attempted",
    "FG_PCT": "FG %",
    "FG3M": "3PM",
    "FG3A": "3PA",
    "FG3_PCT": "3P %",
    "FTM": "FT Made",
    "FTA": "FT Attempted",
    "FT_PCT": "FT%",
    
    # Rebounding
    "OREB": "Off Reb",
    "DREB": "Def Reb",
    "REB": "Rebounds",
    
    # Other Stats
    "AST": "Assists",
    "TOV": "Turnovers",
    "STL": "Steals",
    "BLK": "Blocks",
    "BLKA": "Shots Blocked",
    
    # Fouls/Scoring
    "PF": "Fouls",
    "PFD": "Fouls Drawn",
    "PTS": "Points",
    
    # Special Achievements
    "DD2": "Double Doubles",
    "TD3": "Triple Doubles"
}

def get_clean_season_stats(season):
    # Get player stats
    player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
        season=season,
        season_type_all_star='Regular Season',
        per_mode_detailed='PerGame'
    )
    
    # Get DataFrame
    df = player_stats.get_data_frames()[0]
    
    # Clean column names (remove spaces and special characters)
    df.columns = df.columns.str.strip().str.upper()
    
    # First filter by ORIGINAL columns that exist in the mapping
    available_columns = [col for col in column_mapping.keys() if col in df.columns]
    df = df[available_columns]
    
    # Then rename the columns
    df = df.rename(columns=column_mapping)
    
    # Remove rows with empty columns
    df = df.dropna(how='any')
    
    return df

#Set a season
target_season = "2024-25"

# Get 2024-25 season data
season_stats = get_clean_season_stats(target_season)

# Force output to /scripts/dataset/
SCRIPTS_DIR = Path(__file__).parent.absolute()
DATASET_DIR = SCRIPTS_DIR / "dataset"
DATASET_DIR.mkdir(exist_ok=True)

# Create season-specific filename (ADDED RIGHT BEFORE SAVE FILE)
output_filename = f"players{target_season.replace('/', '-')}.json"

# Save file
output_path = DATASET_DIR / output_filename
season_stats.to_json(output_path, orient="records", indent=2)
print(f"Data saved to: {output_path}")