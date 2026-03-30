# routes_stats.py - Week 6
# Statistics and analytics endpoint

from flask import Blueprint, jsonify

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/stats', methods=['GET'])
def get_statistics():
    """Get usage statistics"""
    return jsonify({
        'total_visits': 0,
        'top_browsers': [],
        'top_countries': []
    }), 200
