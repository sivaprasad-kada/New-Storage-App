import { Github } from 'lucide-react';

const GitHubLoginButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center gap-3 w-full bg-[#24292e] hover:bg-[#2f363d] text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm border border-transparent hover:shadow-md active:scale-95"
        >
            <Github size={20} />
            <span>Sign in with GitHub</span>
        </button>
    );
};
export default GitHubLoginButton;
