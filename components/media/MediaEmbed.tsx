export function MediaEmbed() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <video controls className="w-full">
          <source src="https://example.com/sample-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div>
        <img
          src="https://example.com/sample-image.jpg"
          alt="Sample"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
