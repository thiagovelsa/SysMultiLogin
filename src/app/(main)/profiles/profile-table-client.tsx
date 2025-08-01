"use client";
import dynamic from "next/dynamic";
import React from "react";

const ProfileTable = dynamic(() => import("@/components/profiles/profile-table").then(mod => mod.ProfileTable), {
  loading: () => <div className="py-12 text-center text-muted-foreground">Carregando perfis...</div>,
});

export default function ClientProfileTable() {
  return <ProfileTable />;
}