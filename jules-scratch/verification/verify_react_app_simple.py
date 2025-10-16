import os
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the React app
    page.goto("http://localhost:3000")

    # Wait for the page to load
    page.wait_for_load_state("networkidle")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification_simple.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)