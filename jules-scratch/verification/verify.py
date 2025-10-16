import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Get the absolute path to the HTML file
        file_path = os.path.abspath('index.html')

        # Go to the local HTML file
        await page.goto(f'file://{file_path}')

        # Take a screenshot of the user selection screen
        await page.screenshot(path='jules-scratch/verification/01-user-selection.png')

        # Select 'luohino' and start the chat
        await page.click('button[data-user="Luohino"]')
        await page.click('#loginBtn')

        # Wait for the chat container to be visible
        await page.wait_for_selector('#chatScreen:not(.hidden)')

        # Take a screenshot of the chat screen
        await page.screenshot(path='jules-scratch/verification/02-chat-view.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())