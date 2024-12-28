"use client";

import { TeamPokeballs } from "@/components/TeamPokeballs";
import { useGlobalStore } from "@/stores/global-store-provider";
import { Dialog, DialogPanel, DialogTitle, Field, Label, Select } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";

export default function HomePage() {
  const teams = useGlobalStore((state) => state.teams);
  const createTeams = useGlobalStore((state) => state.createTeams);
  const rerollTeams = useGlobalStore((state) => state.rerollTeams);
  const openAllPokeballs = useGlobalStore((state) => state.openAllPokeballs);
  const settings = useGlobalStore((state) => state.settings);
  const nextTeamIds = useGlobalStore((state) => state.nextTeamIds);
  const changeSetting = useGlobalStore((state) => state.changeSetting);
  const changeNextTeamName = useGlobalStore((state) => state.changeNextTeamId);
  const postTeamsToDiscord = useGlobalStore((state) => state.postTeamsToDiscord);
  const discordUserMapping = useGlobalStore((state) => state.discordUserMapping);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newRoundOpen, setNewRoundOpen] = useState(false);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  const newRoundPressed = () => {
    setNewRoundOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 10);
  };

  const newRoundInitiated = () => {
    setNewRoundOpen(false);
    void createTeams();
  };

  const settingsPressed = () => {
    setSettingsOpen(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-hidden bg-gray-800 py-8">
      {teams.map((team) => (
        <TeamPokeballs key={team.uuid} teamId={team.uuid} />
      ))}
      <div className="flex gap-4">
        <button
          className="rounded-md border-2 border-gray-500 bg-gray-300 px-3 py-2 uppercase text-black hover:bg-gray-400"
          onClick={newRoundPressed}
        >
          New Round
        </button>
        <button
          className="rounded-md border-2 border-gray-500 bg-gray-300 px-3 py-2 uppercase text-black hover:bg-gray-400"
          onClick={rerollTeams}
        >
          Reroll Teams
        </button>
        <button
          className="rounded-md border-2 border-gray-500 bg-gray-300 px-3 py-2 uppercase text-black hover:bg-gray-400"
          onClick={openAllPokeballs}
        >
          Open All Pokeballs
        </button>
        {!settings["Auto Post Teams to Discord"] && (
          <button
            className="rounded-md border-2 border-gray-500 bg-gray-300 px-3 py-2 uppercase text-black hover:bg-gray-400"
            onClick={postTeamsToDiscord}
          >
            Post Teams to Discord
          </button>
        )}
        <button
          className="rounded-md border-2 border-gray-500 bg-gray-300 px-3 py-2 uppercase text-black hover:bg-gray-400"
          onClick={settingsPressed}
        >
          Settings
        </button>
      </div>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 flex w-screen items-center justify-center p-2">
          <DialogPanel className="flex max-w-lg flex-col gap-2 rounded-lg border-2 bg-gray-800 p-4 text-white shadow-lg">
            <DialogTitle className="text-center font-bold">Settings</DialogTitle>
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
            {(
              Object.entries(settings).filter(([_, value]) => typeof value === "string") as [
                keyof typeof settings,
                string,
              ][]
            ).map(([key, value]) => (
              <Fragment key={key}>
                <p>{key}</p>
                <input
                  value={value}
                  placeholder={key}
                  onChange={(event) => void changeSetting(key, event.target.value)}
                  className="h-4 w-full rounded border-gray-500 px-2 py-4 text-black"
                />
              </Fragment>
            ))}
          </DialogPanel>
        </div>
      </Dialog>
      <Dialog open={newRoundOpen} onClose={() => setNewRoundOpen(false)} className="relative z-50">
        <div className="fixed inset-0 flex w-screen items-center justify-center p-2">
          <DialogPanel className="flex max-w-lg flex-col gap-2 rounded-lg border-2 bg-gray-800 p-4 text-white shadow-lg">
            <DialogTitle className="text-center font-bold">New Round</DialogTitle>
            {nextTeamIds.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <Field className="w-full">
                  <Label>Team {index + 1}</Label>
                  <Select
                    ref={index === 0 ? firstInputRef : undefined}
                    value={value}
                    onChange={(event) => void changeNextTeamName(index, event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && newRoundInitiated()}
                    className="w-full rounded border-gray-500 px-2 py-2 text-black"
                  >
                    {Object.entries(discordUserMapping).map(([id, name]) => (
                      <option key={id} value={id} className="font-inherit text-black">
                        {name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            ))}
            <button
              className="mt-2 rounded-md border-2 border-gray-500 bg-gray-300 px-3 py-2 uppercase text-black hover:bg-gray-400"
              onClick={newRoundInitiated}
            >
              Start New Round
            </button>
          </DialogPanel>
        </div>
      </Dialog>
    </main>
  );
}
