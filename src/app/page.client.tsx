"use client";

import { TeamPokeballs } from "@/components/TeamPokeballs";
import { useGlobalStore } from "@/stores/global-store-provider";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

export default function HomePage() {
  const teams = useGlobalStore((state) => state.teams);
  const createTeams = useGlobalStore((state) => state.createTeams);
  const rerollTeams = useGlobalStore((state) => state.rerollTeams);
  const settings = useGlobalStore((state) => state.settings);
  const changeSetting = useGlobalStore((state) => state.changeSetting);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const newTeamsPressed = () => {
    void createTeams(["Team 1", "Team 2"]);
  };

  const rerollTeamsPressed = () => {
    void rerollTeams();
  };

  const settingsPressed = () => {
    setSettingsOpen(true);
  };

  return (
    <main className="flex flex-col items-center justify-center gap-36 min-h-screen overflow-hidden bg-gray-800">
      {teams.map((team) => (
        <TeamPokeballs key={team.uuid} teamId={team.uuid} />
      ))}
      <div className="flex gap-4">
        <button
          className="px-3 py-2 bg-gray-300 text-black rounded-md uppercase border-gray-500 border-2 hover:bg-gray-400"
          onClick={newTeamsPressed}
        >
          New Teams
        </button>
        <button
          className="px-3 py-2 bg-gray-300 text-black rounded-md uppercase border-gray-500 border-2 hover:bg-gray-400"
          onClick={rerollTeamsPressed}
        >
          Reroll Teams
        </button>
        <button
          className="px-3 py-2 bg-gray-300 text-black rounded-md uppercase border-gray-500 border-2 hover:bg-gray-400"
          onClick={settingsPressed}
        >
          Settings
        </button>
      </div>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 flex w-screen items-center justify-center p-2">
          <DialogPanel className="flex flex-col max-w-lg gap-2 border-2 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
            <DialogTitle className="font-bold">Settings</DialogTitle>
            {Object.entries(settings)
              .filter(([_, value]) => typeof value === "boolean")
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(event) =>
                      void changeSetting(key as keyof typeof settings, event.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-500 text-black"
                  />
                  <p onClick={() => changeSetting(key as keyof typeof settings, !value)}>{key}</p>
                </div>
              ))}
          </DialogPanel>
        </div>
      </Dialog>
    </main>
  );
}
