"""
Main entry point for the Personal Trainer API server.
Run this file to start the Flask backend.
"""

if __name__ == '__main__':
    from api.app import app, web_tracker
    
    print("=" * 60)
    print("Personal Trainer Web Server")
    print("=" * 60)
    print("\nStarting web server...")
    print("Open your browser and go to: http://localhost:5000")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        web_tracker.stop()
