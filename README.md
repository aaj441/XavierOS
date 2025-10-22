# XavierOS

**WCAG Machine, eBook Generator & CGP Archetype Engine for Personal Use**

XavierOS combines three powerful tools into one unified API:
- **Lucy**: WCAG 2.1 AA Compliance Checker
- **Project X**: Kindle-friendly eBook Generator
- **CGP Archetype Engine**: Personalized care archetypes and ritual system

---

## Features

### Lucy - WCAG Compliance Checker
- Comprehensive WCAG 2.1 compliance checking
- Checks for Level A, AA, and AAA criteria
- Detailed issue reports with fix suggestions
- Compliance scoring (0-100)
- Validates:
  - Image alt text
  - Heading hierarchy
  - Link accessibility
  - Form labels
  - Color contrast
  - Language attributes
  - Page titles
  - Keyboard accessibility
  - Table structure
  - Multimedia accessibility

### Project X - eBook Generator
- Generate professional eBooks in EPUB format
- Kindle-friendly formatting
- Support for:
  - Multiple chapters
  - Table of contents
  - NCX navigation
  - Cover images
  - Rich metadata (title, author, ISBN, etc.)
  - Custom CSS styling optimized for e-readers
- Base64 file output for easy integration

### CGP Archetype Engine
- 7 distinct care archetypes for personalized wellness
- Personalized archetype recommendations based on your state and concerns
- Daily ritual practices for each archetype
- PDF guides available for download
- Archetypes include:
  - **Griefwalker**: For rest, gentleness, and soothing support
  - **Fighter**: For justice, resilience, and advocacy
  - **Self-Protector**: For privacy, calm, and boundaries
  - **Seeker**: For freedom, wonder, and exploration
  - **Solo Architect**: For clarity, independence, and minimalism
  - **Connector**: For belonging, support, and community
  - **Nurturer**: For wholeness, inner peace, and integrative care
- Integration with Lucy and Project X for archetype-specific content
- Foundation for future Ritual-Union sound therapy integration

---

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd XavierOS
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**
   ```bash
   python app.py
   ```
   Or:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Access the API**
   - API Root: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

### Railway Deployment

The application is configured for Railway deployment with automatic detection.

1. **Connect your GitHub repository to Railway**
2. **Railway will automatically detect the configuration** from `railway.toml` or `Procfile`
3. **Set environment variables** (if needed)
4. **Deploy!**

The 404 error you experienced should be resolved with the proper configuration files now in place.

---

## API Endpoints

### Root & Health

- `GET /` - API information
- `GET /health` - Health check (for Railway monitoring)

### Lucy - WCAG Compliance

- `POST /lucy/check` - Check HTML for WCAG compliance
  ```json
  {
    "html_content": "<html>...</html>",
    "url": "https://example.com" (optional)
  }
  ```

- `GET /lucy/info` - Get information about Lucy's capabilities

### Project X - eBook Generation

- `POST /project-x/generate` - Generate eBook (returns base64)
  ```json
  {
    "metadata": {
      "title": "My Book",
      "author": "Author Name",
      "language": "en"
    },
    "chapters": [
      {
        "title": "Chapter 1",
        "content": "<p>Content...</p>",
        "order": 1
      }
    ],
    "format": "epub",
    "enable_toc": true,
    "enable_ncx": true
  }
  ```

- `POST /project-x/download` - Generate and download eBook directly
- `GET /project-x/info` - Get information about Project X's capabilities

### CGP Archetype Engine

- `GET /cgp/archetypes` - Get all 7 available archetypes
- `GET /cgp/archetype/{name}` - Get specific archetype details
  - Available names: Griefwalker, Fighter, Self-Protector, Seeker, Solo Architect, Connector, Nurturer
- `POST /cgp/recommend` - Get personalized archetype recommendations
  ```json
  {
    "current_state": "overwhelmed and tired",
    "concerns": ["burnout", "rest", "gentle support"],
    "preferences": {}
  }
  ```
- `GET /cgp/pdf/{name}` - Download archetype PDF guide
- `GET /cgp/ritual/{name}` - Get just the ritual text for an archetype
- `GET /cgp/report/{name}` - Get comprehensive archetype report with integration suggestions
- `GET /cgp/info` - Get information about CGP Engine's capabilities

### Combined Workflow

- `POST /workflow/check-and-generate` - Check WCAG compliance AND generate eBook in one request

---

## Example Usage

### Check WCAG Compliance (Lucy)

```python
import requests

response = requests.post('http://localhost:8000/lucy/check', json={
    "html_content": """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>My Accessible Page</title>
    </head>
    <body>
        <h1>Welcome</h1>
        <img src="logo.png" alt="Company Logo">
        <p>This is accessible content.</p>
    </body>
    </html>
    """
})

report = response.json()
print(f"Compliance Score: {report['score']}")
print(f"Total Issues: {report['total_issues']}")
```

### Generate eBook (Project X)

```python
import requests
import base64

response = requests.post('http://localhost:8000/project-x/generate', json={
    "metadata": {
        "title": "My First eBook",
        "author": "John Doe",
        "language": "en",
        "description": "A sample eBook"
    },
    "chapters": [
        {
            "title": "Introduction",
            "content": "<p>Welcome to my book...</p>",
            "order": 1
        },
        {
            "title": "Chapter 1",
            "content": "<p>This is the first chapter...</p>",
            "order": 2
        }
    ],
    "format": "epub"
})

result = response.json()
if result['success']:
    # Decode and save the eBook
    ebook_data = base64.b64decode(result['file_data'])
    with open(result['filename'], 'wb') as f:
        f.write(ebook_data)
    print(f"eBook saved: {result['filename']}")
```

### Get Archetype Recommendations (CGP)

```python
import requests

response = requests.post('http://localhost:8000/cgp/recommend', json={
    "current_state": "feeling overwhelmed and burned out",
    "concerns": ["rest", "gentle support", "avoiding burnout"],
    "preferences": {}
})

recommendations = response.json()
for rec in recommendations:
    print(f"{rec['archetype_name']} (confidence: {rec['confidence']})")
    print(f"  Reason: {rec['reasoning']}\n")

# Get details for top recommendation
top_archetype = recommendations[0]['archetype_name']
archetype_response = requests.get(f'http://localhost:8000/cgp/archetype/{top_archetype}')
archetype = archetype_response.json()

print(f"Your archetype: {archetype['name']}")
print(f"Ritual: {archetype['data']['ritual']}")
print(f"Values: {', '.join(archetype['data']['values'])}")

# Download PDF guide
pdf_response = requests.get(f'http://localhost:8000/cgp/pdf/{top_archetype}')
if pdf_response.status_code == 200:
    with open(f'{top_archetype}.pdf', 'wb') as f:
        f.write(pdf_response.content)
    print(f"PDF guide saved: {top_archetype}.pdf")
```

### Using cURL

```bash
# Check WCAG compliance
curl -X POST http://localhost:8000/lucy/check \
  -H "Content-Type: application/json" \
  -d '{"html_content": "<html><body><h1>Test</h1></body></html>"}'

# Get Lucy info
curl http://localhost:8000/lucy/info

# Get Project X info
curl http://localhost:8000/project-x/info

# Get all archetypes
curl http://localhost:8000/cgp/archetypes

# Get specific archetype
curl http://localhost:8000/cgp/archetype/Griefwalker

# Get archetype recommendations
curl -X POST http://localhost:8000/cgp/recommend \
  -H "Content-Type: application/json" \
  -d '{"current_state": "overwhelmed", "concerns": ["burnout", "rest"]}'

# Get CGP info
curl http://localhost:8000/cgp/info
```

---

## Interactive API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Both provide interactive API documentation where you can test endpoints directly.

---

## Technology Stack

- **FastAPI**: Modern Python web framework
- **BeautifulSoup4**: HTML parsing for WCAG checks
- **ebooklib**: EPUB generation
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

---

## File Structure

```
XavierOS/
├── app.py                              # Main FastAPI application
├── lucy.py                             # WCAG compliance checker
├── project_x.py                        # eBook generator
├── cgp_engine.py                       # CGP Archetype Engine
├── archetype_prompt_vault_waltz4.json  # Archetype data
├── ritual_union_schema.json            # Ritual-Union architecture spec
├── *.pdf                               # Archetype PDF guides (7 files)
├── requirements.txt                    # Python dependencies
├── Procfile                           # Railway/Heroku deployment
├── railway.toml                       # Railway configuration
├── runtime.txt                        # Python version
├── README.md                          # This file
└── XOS (2)/                           # Legacy A5-Browser-Use project (kept for reference)
```

---

## Troubleshooting

### Railway 404 Error
The 404 error was caused by missing deployment configuration. The following files now ensure proper Railway deployment:
- `Procfile` - Tells Railway how to start the app
- `railway.toml` - Advanced Railway configuration
- `runtime.txt` - Specifies Python version

The app now binds to `0.0.0.0` and uses the `$PORT` environment variable provided by Railway.

### Port Issues
Railway automatically provides a `PORT` environment variable. The app will use port 8000 locally and automatically adapt to Railway's assigned port.

### Missing Dependencies
If you encounter import errors, ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

---

## Contributing

This is a personal project, but suggestions and improvements are welcome!

---

## License

MIT License - Feel free to use for personal projects.

---

## Support

For issues or questions:
1. Check the interactive API docs at `/docs`
2. Review the `/lucy/info` and `/project-x/info` endpoints
3. Ensure all dependencies are installed
4. Verify Railway environment variables are set correctly

**Railway Health Check**: Use the `/health` endpoint to verify the service is running.
