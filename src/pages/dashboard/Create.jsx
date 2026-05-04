import { Link } from "react-router";

const Create = () => {
  return (
    <div>
      <h1 className="text-3xl font-black text-black mb-6">Create Resume ✨</h1>

      <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center">
        <p className="text-gray-500 mb-4">Resume builder UI coming next...</p>

        <Link to="/resume/new">
          <button className="btn btn-primary">Start Building</button>
        </Link>
      </div>
    </div>
  );
};

export default Create;
