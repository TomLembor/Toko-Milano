"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";

type CartQuantities = Record<string, number>;

type Profile = {
  name: string;
  whatsapp: string;
};

type StorefrontState = {
  quantities: CartQuantities;
  setQuantities: Dispatch<SetStateAction<CartQuantities>>;
  profile: Profile;
  setProfile: Dispatch<SetStateAction<Profile>>;
  profileReady: boolean;
  profileMessage: string;
  setProfileMessage: Dispatch<SetStateAction<string>>;
  saveProfile: (event: FormEvent<HTMLFormElement>) => void;
};

const emptyProfile: Profile = { name: "", whatsapp: "" };

const StorefrontStateContext = createContext<StorefrontState | null>(null);

export function StorefrontStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [quantities, setQuantities] = useState<CartQuantities>({});
  const [profile, setProfile] = useState(emptyProfile);
  const [profileReady, setProfileReady] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    try {
      const savedProfile = window.localStorage.getItem("toko-milano-profile");
      if (savedProfile) {
        const parsedProfile: unknown = JSON.parse(savedProfile);
        if (
          typeof parsedProfile === "object" &&
          parsedProfile !== null &&
          "name" in parsedProfile &&
          "whatsapp" in parsedProfile &&
          typeof parsedProfile.name === "string" &&
          typeof parsedProfile.whatsapp === "string"
        ) {
          setProfile({
            name: parsedProfile.name,
            whatsapp: parsedProfile.whatsapp,
          });
        } else {
          setProfileMessage("Data profil tersimpan tidak dapat dibaca.");
        }
      }
    } catch {
      setProfileMessage("Profil tidak dapat dimuat dari penyimpanan perangkat.");
    } finally {
      setProfileReady(true);
    }
  }, []);

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(
        "toko-milano-profile",
        JSON.stringify(profile),
      );
      setProfileMessage("Profil tersimpan di perangkat ini.");
    } catch {
      setProfileMessage("Profil tidak dapat disimpan di perangkat ini.");
    }
  }

  return (
    <StorefrontStateContext.Provider
      value={{
        quantities,
        setQuantities,
        profile,
        setProfile,
        profileReady,
        profileMessage,
        setProfileMessage,
        saveProfile,
      }}
    >
      {children}
    </StorefrontStateContext.Provider>
  );
}

export function useStorefrontState() {
  const state = useContext(StorefrontStateContext);
  if (!state) {
    throw new Error(
      "useStorefrontState must be used within StorefrontStateProvider.",
    );
  }
  return state;
}
