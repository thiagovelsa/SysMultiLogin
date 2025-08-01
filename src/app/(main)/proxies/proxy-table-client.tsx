"use client";
import dynamic from "next/dynamic";
import React from "react";

const ProxyTable = dynamic(() => import("@/components/proxies/proxy-table").then(mod => mod.ProxyTable), {
  loading: () => <div className='py-12 text-center text-muted-foreground'>Carregando proxies...</div>,
});

export default function ClientProxyTable() {
  return <ProxyTable />;
}