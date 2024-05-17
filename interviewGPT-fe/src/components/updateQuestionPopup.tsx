export default function UpdateQuestionPopup({
  handleUpdate,
}: {
  handleUpdate: () => void;
}) {
  return (
    <div className="absolute z-10 h-[60%] w-[60%] bg-white text-black text-center border-2 border-black">
      <label htmlFor="Prompt">Enter Prompt:</label>
      <br />
      <textarea
        className="w-full h-[80%] active:outline-none"
        id="Prompt"
        name="Prompt"
        required
        placeholder="Prompt"
      />
      <button onClick={handleUpdate} className="w-full">
        Update
      </button>
    </div>
  );
}
