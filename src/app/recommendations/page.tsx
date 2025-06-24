import { SideBar } from "@/components/SideBar";

export default function RecommendationsPage() {
    return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-6">
            <h1>Recommendations</h1>
            <p>Your personalized recommendations will be displayed here.</p>
        </div>
            </div>
    );
}