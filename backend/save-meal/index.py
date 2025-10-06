"""
Business: Save user meal entry to database with nutritional data
Args: event - dict with httpMethod, body (meal data), headers (X-User-Id)
      context - object with attributes: request_id, function_name
Returns: JSON with saved meal ID and data
"""
import json
import os
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database not configured'})
            }
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            headers = event.get('headers', {})
            user_id = headers.get('x-user-id') or headers.get('X-User-Id') or 1
            
            food_id = body_data.get('food_id')
            custom_name = body_data.get('name')
            calories = body_data.get('calories')
            protein = body_data.get('protein')
            carbs = body_data.get('carbs')
            fat = body_data.get('fat')
            meal_time = body_data.get('meal_time', datetime.now().isoformat())
            photo_url = body_data.get('photo_url')
            
            if not all([calories is not None, protein is not None, carbs is not None, fat is not None]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            sql = """
                INSERT INTO meals (user_id, food_id, custom_name, calories, protein, carbs, fat, meal_time, photo_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, custom_name, calories, protein, carbs, fat, meal_time
            """
            cur.execute(sql, (user_id, food_id, custom_name, calories, protein, carbs, fat, meal_time, photo_url))
            result = cur.fetchone()
            conn.commit()
            
            response_data = dict(result)
            response_data['protein'] = float(response_data['protein'])
            response_data['carbs'] = float(response_data['carbs'])
            response_data['fat'] = float(response_data['fat'])
            response_data['meal_time'] = response_data['meal_time'].isoformat()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps(response_data, ensure_ascii=False)
            }
        
        elif method == 'GET':
            headers = event.get('headers', {})
            user_id = headers.get('x-user-id') or headers.get('X-User-Id') or 1
            query_params = event.get('queryStringParameters') or {}
            date_filter = query_params.get('date')
            
            if date_filter:
                sql = """
                    SELECT id, custom_name as name, calories, protein, carbs, fat, 
                           TO_CHAR(meal_time, 'HH24:MI') as time, meal_time
                    FROM meals
                    WHERE user_id = %s AND DATE(meal_time) = %s
                    ORDER BY meal_time DESC
                """
                cur.execute(sql, (user_id, date_filter))
            else:
                sql = """
                    SELECT id, custom_name as name, calories, protein, carbs, fat,
                           TO_CHAR(meal_time, 'HH24:MI') as time, meal_time
                    FROM meals
                    WHERE user_id = %s
                    ORDER BY meal_time DESC
                    LIMIT 50
                """
                cur.execute(sql, (user_id,))
            
            rows = cur.fetchall()
            
            results = []
            for row in rows:
                meal_data = dict(row)
                meal_data['protein'] = float(meal_data['protein'])
                meal_data['carbs'] = float(meal_data['carbs'])
                meal_data['fat'] = float(meal_data['fat'])
                meal_data.pop('meal_time', None)
                results.append(meal_data)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps(results, ensure_ascii=False)
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Operation failed: {str(e)}'})
        }