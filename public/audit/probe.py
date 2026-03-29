from playwright.sync_api import sync_playwright

ports = [3001, 3002, 3003]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for port in ports:
        try:
            page = browser.new_page(viewport={"width": 800, "height": 600})
            page.goto(f"http://localhost:{port}", wait_until="networkidle", timeout=5000)
            title = page.title()
            # Get first visible text
            text = page.text_content("body")[:200] if page.text_content("body") else "empty"
            print(f"Port {port}: title='{title}' | text='{text[:100]}...'")
            page.close()
        except Exception as e:
            print(f"Port {port}: {e}")
    browser.close()
