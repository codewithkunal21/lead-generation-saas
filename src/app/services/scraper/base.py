import logging
import re
from contextlib import asynccontextmanager
from typing import AsyncGenerator, List, Optional
from bs4 import BeautifulSoup
from playwright.async_api import Browser, async_playwright

# Setup dedicated scraper logger
logger = logging.getLogger("scraper")

class BaseScraper:
    """Base scraper class providing shared Playwright browser lifecycle utilities."""
    
    def __init__(self, headless: bool = True):
        self.headless = headless

    @asynccontextmanager
    async def get_browser(self) -> AsyncGenerator[Browser, None]:
        """Async context manager to safely yield a Playwright browser instance."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=self.headless,
                args=["--no-sandbox", "--disable-setuid-sandbox"]  # Crucial for Docker compatibility
            )
            try:
                yield browser
            finally:
                await browser.close()

    def clean_text(self, text: Optional[str]) -> Optional[str]:
        """Normalize whitespace and strip leading/trailing characters."""
        if not text:
            return None
        return " ".join(text.split()).strip()

    def extract_emails_from_text(self, text: str) -> List[str]:
        """Extract email addresses from plain text using regex."""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        return sorted(list(set(re.findall(email_pattern, text))))

    def extract_phones_from_text(self, text: str) -> List[str]:
        """Extract phone number patterns from plain text."""
        # Captures standard formatting like +91 99999-99999, (123) 456-7890, etc.
        phone_pattern = r'\+?\d{1,4}[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
        matches = re.findall(phone_pattern, text)
        results = []
        for m in matches:
            cleaned = re.sub(r'[\s\-\(\)\+]', '', m)
            if 8 <= len(cleaned) <= 15:
                results.append(m.strip())
        return sorted(list(set(results)))
