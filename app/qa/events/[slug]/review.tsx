"use client";
import { useState } from 'react';
import type { Invitation } from '@/lib/types';
import type { CollectionDesign } from '@/lib/collectionTemplates';
import { CollectionInvite } from '@/components/CollectionInvite';
import { InvitationExperience } from '@/components/InvitationExperience';

export function EventReview({ invitation, design }: { invitation: Invitation; design: CollectionDesign }) {
  const [value,setValue] = useState(invitation);
  const [editing,setEditing] = useState(false);
  const [locale,setLocale] = useState('ky');
  return <><nav aria-label="QA" style={{display:'flex',gap:20,padding:12}}><button onClick={()=>setEditing(v=>!v)}>Editor</button><button onClick={()=>setLocale(v=>v==='ky'?'ru':'ky')}>KY / RU</button></nav>
    <InvitationExperience invitation={value} locale={locale} intro={!editing} variant="cream" embedded>
      <CollectionInvite invitation={value} design={design} locale={locale} onChange={editing ? patch=>setValue(v=>({...v,...patch})) : undefined}/>
    </InvitationExperience></>;
}
