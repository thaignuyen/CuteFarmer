import webbrowser
import threading
import time
import uvicorn

def open_browser():
    time.sleep(1.2)
    print("\n[+] Đang mở Game Cute Fantasy trên trình duyệt web tại http://127.0.0.1:8000 ...")
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == "__main__":
    print("================================================================")
    print("  🎮 CUTE FANTASY RPG - PHIÊU LƯU & NÔNG TRẠI LÀNG QUÊ")
    print("  Backend: FastAPI (Python) | Frontend: HTML5 Canvas, CSS3, JS")
    print("================================================================")
    
    # Auto open browser in separate thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Run FastAPI web server
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
