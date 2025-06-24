import { SideBar } from "@/components/SideBar";

export default function WatchlistPage() {
    return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-6">
                <h1>Watchlist</h1>
                <p>Your watchlist items will be displayed here.</p>
            </div>
        </div>
    );
}
