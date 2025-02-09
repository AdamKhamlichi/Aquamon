import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <>
      <Navigation />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "70vh", textAlign: "center", padding: "0 20px", color: "white" }}>
        <h1>
          Our project during the 2025 hackathon aimed to raise awareness and inspire people to care about the aquatic world.
          We used Lovable, an AI-powered app that creates personalized and engaging content to connect emotionally with audiences.
          By leveraging Lovable, we designed impactful messages and campaigns to highlight the importance of protecting aquatic ecosystems.
        </h1>
        <p style={{ marginTop: "20px", fontSize: "18px" }}>
          We also integrated a search tool powered by ChatGPT that allows users to explore and discover information about the sea.
          This tool helps raise awareness and provides insights on marine life, ecosystems, and ways to protect our oceans.
        </p>
      </div>
      <footer className="footer-wiggle fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 py-2 px-4 z-50">
        This game has been made by: Seif Boukerdenna, Peter Ghadban, Adam Khamlichi, Pierre Olivier Piquant
      </footer>
    </>
  );

}

export default About;