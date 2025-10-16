import os
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the React app
    page.goto("http://localhost:8000")

    # Login
    page.wait_for_selector('.user-option[data-user="Luohino"]')
    page.click('.user-option[data-user="Luohino"]')
    page.fill('#passwordInput', 'a1n2i3k4e5t6')
    page.click('#loginBtn')

    # Start a voice call
    page.wait_for_selector('#voiceCallBtn')
    page.click('#voiceCallBtn')

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)