import os
import sys

# Add both the app directory and its parent to Python path
app_dir = os.path.abspath(os.path.dirname(__file__))
parent_dir = os.path.dirname(app_dir)
sys.path.insert(0, app_dir)
sys.path.insert(0, parent_dir)
