import requests
from bs4 import BeautifulSoup
import re
import openai

def AIcall(text):
    client = openai.OpenAI(
    api_key="c0978b82-5688-4a3d-b295-c8fd892f5ae8",
    base_url="https://api.sambanova.ai/v1",
    )

    response = client.chat.completions.create(
        model='Llama-3.2-90B-Vision-Instruct',
        messages=[{"role":"system","content":text},{"role":"user","content":"Hello"}],
        temperature =  0.1,
        top_p = 0.1
    )
    print(response.choices[0].message.content)
    return response.choices[0].message.content

def extract_webpage_data(url):
    try:
        # Fetch the webpage
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for HTTP issues
        
        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract and print webpage title
        title = soup.title.string.strip() if soup.title else "No Title Found"
        print(f"Title: {title}\n")
        
        # Extract and clean all text content
        raw_text = soup.get_text()
        cleaned_text = re.sub(r'\s+', ' ', raw_text).strip()  # Remove extra spaces and normalize whitespace
        print("Cleaned Text Content:")
        print(cleaned_text)
        
        # Extract and print all links
        print("\nLinks:")
        for link in soup.find_all('a', href=True):
            print(link['href'])
        
        # Extract and print images
        print("\nImages:")
        for img in soup.find_all('img', src=True):
            print(img['src'])
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the webpage: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")


    prompt = f'''{cleaned_text} Using the provided hackathon data, generate project ideas tailored to the given track prizes. At the top, include the hackathon name as a heading styled with inline CSS. For each track, create a section where the project ideas are displayed in individual cards. Each idea should have its own card, showing the idea description and the prize for the track prominently. Use a modern card-based layout with flexbox for the structure, arranging the cards in a column within each section. Each card should have a class card and an additional unique class (card1, card2, card3, etc.) based on its sequence. Add an onclick function named cardClick to each card, passing the respective card's class name as a parameter (e.g., card1, card2, card3). The design should feature a dark black background with blue accents, clean and modern typography, and proper spacing for readability. Relevant icons should enhance the visual appeal of the cards. At the end, include a separate section summarizing all hackathon prizes in detail, also using a card-based layout. Ensure the output consists solely of HTML inside the <body> tag, formatted for direct assignment to innerHTML in JavaScript, with all necessary styling provided inline. The design should maintain a consistent dark aesthetic, avoiding colorful or patterned backgrounds. card should be in this formate     <div class="card card2" onclick="cardClick('card2')">
      <i class="card-icon fas fa-robot"></i>
      <div class="card-title">titie</div>
      <div class="card-description">description</div>
      <div class="card-prize">amount</div>
    </div> 
    donot give any text outside the body tag like: Here's the HTML code for the hackathon project ideas and prizes:
    '''

    return AIcall(prompt)


def details(textdata):

    prompt = f''' {textdata} Create a detailed and comprehensive step-by-step guide for a hackathon-friendly project, and format the output entirely in HTML with inline CSS. The HTML should feature a dark theme with one accent color, clean typography, and consistent spacing. The guide should provide detailed explanations and practical examples, resembling a proper documentation-style guide. It should include sections starting with the Project Overview, where a detailed description of the project's purpose and benefits is provided, explaining how it adapts to users' coding styles and offers intelligent suggestions to enhance productivity.

The Key Features section should list and describe the main functionalities, including real-time suggestions that provide contextual coding suggestions as users type, personalized learning that tracks user behavior to customize suggestions over time, multi-language support to broaden usability, and seamless integration to enhance user experience with popular IDEs. The Technology Stack section should specify all required tools, frameworks, and technologies, including AI/ML models like GPT-based systems for intelligent suggestions, backend programming languages like Python or Node.js, frontend frameworks like React.js, and libraries or SDKs for IDE integration.

The Step-by-Step Implementation Guide should provide clear substeps for building the project with sample code snippets formatted for clarity. The Testing and Debugging section should discuss methods for testing the model's accuracy, validating predictions, debugging issues with relevant tools and techniques, and optimizing real-time performance using strategies like caching and batching API calls. In the Deployment section, provide deployment options, such as deploying the project as an IDE plugin for tools like VS Code or JetBrains IDEs, or as a standalone desktop or web application using hosting services like Vercel or Electron.

Finally, the Future Enhancements section should suggest ways to improve the project, such as supporting additional programming languages for broader usability, adding collaborative coding features like real-time code sharing, and integrating real-time feedback from users to drive continuous improvement. The output should only include the <body> section with structured HTML tags and inline CSS. The design must feature an elegant dark theme with one accent color for headings, clean fonts for readability, and well-styled div boxes to present each section. At the end of the document, each section should be summarized in a brief and visually distinct div box with proper styling and inline CSS for clarity. The result should be visually appealing, easy to follow, and well-structured.'''
    return AIcall(prompt)

