"""
Business: Search food products in database by name with nutritional info
Args: event - dict with httpMethod, queryStringParameters (q - search query)
      context - object with attributes: request_id, function_name
Returns: JSON array with matching food products
"""
import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        import psycopg2
        
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database not configured'})
            }
        
        query_params = event.get('queryStringParameters') or {}
        search_query = query_params.get('q', '').strip()
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        if search_query:
            sql = """
                SELECT id, name, calories, protein, carbs, fat, category, serving_size
                FROM food_database
                WHERE LOWER(name) LIKE LOWER(%s) OR LOWER(name_en) LIKE LOWER(%s)
                ORDER BY 
                    CASE 
                        WHEN LOWER(name) = LOWER(%s) THEN 1
                        WHEN LOWER(name) LIKE LOWER(%s) THEN 2
                        ELSE 3
                    END,
                    name
                LIMIT 20
            """
            search_pattern = f'%{search_query}%'
            cur.execute(sql, (search_pattern, search_pattern, search_query, f'{search_query}%'))
        else:
            sql = """
                SELECT id, name, calories, protein, carbs, fat, category, serving_size
                FROM food_database
                ORDER BY name
                LIMIT 20
            """
            cur.execute(sql)
        
        rows = cur.fetchall()
        
        results = []
        for row in rows:
            results.append({
                'id': row[0],
                'name': row[1],
                'calories': row[2],
                'protein': float(row[3]),
                'carbs': float(row[4]),
                'fat': float(row[5]),
                'category': row[6],
                'serving_size': row[7]
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps(results, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Search failed: {str(e)}'})
        }