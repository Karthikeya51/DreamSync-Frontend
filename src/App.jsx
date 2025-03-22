import "./App.css";
import React, { useState } from "react";

const StoryGenerator = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [storyType, setStoryType] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isNarrating, setIsNarrating] = useState(false);

  const generateStory = async () => {
    if (!name.trim() || !age.trim() || !storyType.trim()) return;
    setLoading(true);
    setStory("");
    setAudioUrl(null); // Reset previous narration

    const userPrompt = `Create a captivating ${storyType} story for a ${age}-year-old child named ${name}. The story should be engaging, imaginative, and suitable for their age. Keep it fun, adventurous, and full of surprises! 
    Strictly ensure the story does not exceed 2000 characters in length.`;
    
    try {
      const response = await fetch("http://localhost:8080/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const data = await response.json();
      setStory(data.story);
    } catch (error) {
      console.error("Error generating story:", error);
      setStory("Failed to generate story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const narrateStory = async () => {
    if (!story.trim()) return;
    setIsNarrating(true);

    try {
      const response = await fetch("http://localhost:8080/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: story }),
      });

      if (!response.ok) {
        throw new Error(`Narration Failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Revoke previous URL to prevent memory leaks
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);
    } catch (error) {
      console.error("Error generating narration:", error);
      alert("Failed to generate narration. Try again.");
    } finally {
      setIsNarrating(false);
    }
  };

  return (
    <div className="full-screen-container">
      <div className="card-custom">
        <h1>DreamSync AI</h1>
        <p>– Personalized Tales for Little Dreamers</p>

        <div className="form-group">
          <input
            className="form-control-custom"
            type="text"
            placeholder="Enter child's name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            className="form-control-custom"
            type="number"
            placeholder="Enter child's age..."
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            className="form-control-custom"
            type="text"
            placeholder="Enter story type (e.g., adventure, fairy tale, mystery)..."
            value={storyType}
            onChange={(e) => setStoryType(e.target.value)}
          />
        </div>

        <button
          className="btn-custom"
          onClick={generateStory}
          disabled={loading || !name.trim() || !age.trim() || !storyType.trim()}
        >
          {loading ? "Generating..." : "Generate Story"}
        </button>

        {story && (
          <div className="generated-story">
            <h5>Generated Story:</h5>
            <p>{story}</p>

            <button
              className="btn-custom"
              onClick={narrateStory}
              disabled={isNarrating}
            >
              {isNarrating ? "Narrating..." : "Narrate Story"}
            </button>

            {audioUrl && (
            <div className="narration-container">
              <h3 className="narration-title">
                <span role="img" aria-label="speaker">📢</span> STORY NARRATION
              </h3>
              <div className="audio-wrapper">
                <audio controls className="audio-player">
                  <source src={audioUrl} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}


          </div>
        )}
      </div>
    </div>
  );
};

export default StoryGenerator;
