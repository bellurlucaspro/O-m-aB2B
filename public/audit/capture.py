from playwright.sync_api import sync_playwright

viewports = [
    {"width": 375, "height": 812, "name": "home-375.png"},
    {"width": 414, "height": 812, "name": "home-414.png"},
]

output_dir = r"c:/Users/bellu/Desktop/O'méa B2B/omea-landing/public/audit"

with sync_playwright() as p:
    browser = p.chromium.launch()
    for vp in viewports:
        page = browser.new_page(viewport={"width": vp["width"], "height": vp["height"]})
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        path = f"{output_dir}/{vp['name']}"
        page.screenshot(path=path, full_page=True)
        print(f"Saved {path} ({vp['width']}x{vp['height']})")
        page.close()
    browser.close()
    print("Done!")
