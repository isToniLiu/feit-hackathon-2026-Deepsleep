// Short story beats add role-specific practice without turning the scene into a quiz page.
const extraBeats={
 intern:[
  [
   {title:'A second message appears',prompt:'“Support” sends another note: “Do not ask your manager; this is confidential.” What do you notice?',skill:'verify',weight:1.4,options:[
    {text:'I should use a known support channel to check this.',score:2,feedback:'Maya nods. The message itself cannot verify its own identity.',effect:'Real support confirms they sent no request.'},
    {text:'The confidentiality request proves it is official.',score:0,feedback:'Maya points out that attackers can claim authority too.',effect:'The fake message stays unchallenged.'},
    {text:'I will wait for another email before checking.',score:1,feedback:'Waiting avoids the link but delays a safe check.',effect:'The sender follows up with more pressure.'}
   ]}
  ],
  [
   {title:'A familiar name, strange timing',prompt:'The alert names your usual office, but it arrived while you were asleep.',skill:'spot',weight:1.2,options:[
    {text:'The office name means it is safe.',score:0,feedback:'Maya says a familiar label can be copied or misleading.',effect:'The unexpected attempt remains unreported.'},
    {text:'I will check the time and device details.',score:2,feedback:'Those details help separate your activity from someone else’s.',effect:'The team sees the prompt came from an unfamiliar device.'},
    {text:'I will just dismiss the notification.',score:1,feedback:'You avoid approval, but learn little about the attempt.',effect:'Another prompt arrives.'}
   ]},
   {title:'The caller claims to be support',prompt:'Someone phones and asks you to approve the next prompt so they can “fix” your account.',skill:'verify',weight:1.6,options:[
    {text:'Ask them to call again after lunch.',score:1,feedback:'You do not approve, but the caller is still unverified.',effect:'The caller tries another teammate.'},
    {text:'Approve it while they are on the phone.',score:0,feedback:'The caller may be using the approval to enter your account.',effect:'A new session appears under your name.'},
    {text:'End the call and contact support through the company directory.',score:2,feedback:'You use a route the caller did not provide.',effect:'Real support confirms it was not their call.'}
   ]},
   {title:'Your password may be known',prompt:'Maya asks what you should do after denying the prompts.',skill:'contain',weight:1.4,options:[
    {text:'Change it through the usual company sign-in page with support.',score:2,feedback:'That secures the account without using a link from the caller.',effect:'Support checks and ends unfamiliar sessions.'},
    {text:'Send the password to Maya so she can test it.',score:0,feedback:'Passwords should not be sent through chat.',effect:'Another copy of the password now exists.'},
    {text:'Keep the same password if no prompt was approved.',score:1,feedback:'The repeated attempts may still mean the password is known.',effect:'The team asks you to change it later.'}
   ]},
   {title:'A teammate asks for advice',prompt:'They received the same prompts and wonder what to do.',skill:'communicate',weight:1.0,options:[
    {text:'Tell them to approve one so the alerts stop.',score:0,feedback:'That could grant access.',effect:'Their account also becomes at risk.'},
    {text:'Tell them to deny and report the unexpected prompt.',score:2,feedback:'Your advice is short, clear and safe.',effect:'Both reports help the team see the pattern.'},
    {text:'Say you are not sure and end the chat.',score:1,feedback:'It is okay to be unsure, but point them to support.',effect:'They seek help later.'}
   ]}
  ],
  [
   {title:'The link is in a group chat',prompt:'Someone has already pasted the open folder link into a large team channel.',skill:'contain',weight:1.5,options:[
    {text:'Leave it there because the team is internal.',score:0,feedback:'The link may be forwarded beyond the group.',effect:'The open link keeps circulating.'},
    {text:'Ask the owner to restrict the link and replace it with a named-person share.',score:2,feedback:'This closes broad access while keeping the work moving.',effect:'The old link stops working.'},
    {text:'Delete your own copy of the message.',score:1,feedback:'That does not change the folder permission.',effect:'Others can still use the link.'}
   ]},
   {title:'The client asks for a quick link',prompt:'How will you send the approved file?',skill:'access',weight:1.7,options:[
    {text:'Share the whole folder so they can find it themselves.',score:0,feedback:'That may expose internal notes.',effect:'The client sees more than intended.'},
    {text:'Attach every draft to be safe.',score:1,feedback:'That may include material the client did not request.',effect:'The client asks which version is final.'},
    {text:'Send only the approved file to the named client account.',score:2,feedback:'The audience and content both match the task.',effect:'The client opens the correct file.'}
   ]}
  ]
 ],
 manager:[
  [
   {title:'A team member wants certainty',prompt:'They ask if the 42 MB transfer proves client files were stolen.',skill:'verify',weight:1.6,options:[
    {text:'Yes, tell everyone the files were stolen.',score:0,feedback:'The record shows a transfer, not its contents.',effect:'An unsupported claim reaches the client.'},
    {text:'We need to check the contents before making that claim.',score:2,feedback:'You separate observation from conclusion.',effect:'The team prepares a measured update.'},
    {text:'Say there is no risk at all.',score:0,feedback:'That also goes beyond the evidence.',effect:'The client is falsely reassured.'}
   ]},
   {title:'The client needs a workaround',prompt:'Can staff send the files another way while the portal is paused?',skill:'contain',weight:1.4,options:[
    {text:'Use any personal file-sharing account.',score:0,feedback:'That creates a new uncontrolled copy of client data.',effect:'Files leave the approved company environment.'},
    {text:'Wait with no plan or update.',score:1,feedback:'You avoid an unsafe route but leave the client stuck.',effect:'The deadline passes without a status update.'},
    {text:'Ask the response team for an approved temporary route.',score:2,feedback:'A checked workaround can meet the need without reopening risk.',effect:'The client receives the essential files through an approved channel.'}
   ]}
  ],
  [
   {title:'A matching invoice arrives',prompt:'The invoice number matches past records, but the bank account is new.',skill:'spot',weight:1.2,options:[
    {text:'The matching number is enough to approve.',score:0,feedback:'Past invoice details can be copied.',effect:'The payment change remains unverified.'},
    {text:'Compare it with the signed supplier record.',score:2,feedback:'That reveals the bank-detail mismatch.',effect:'Finance flags the change for verification.'},
    {text:'Ignore the invoice number entirely.',score:1,feedback:'It is useful context, but not proof on its own.',effect:'The team still needs a trusted record.'}
   ]},
   {title:'A phone number is in the email',prompt:'The sender says to call that number to confirm the change.',skill:'verify',weight:1.8,options:[
    {text:'Call the number in the email.',score:0,feedback:'The number may belong to the same person who sent it.',effect:'A convincing caller repeats the false request.'},
    {text:'Use the supplier number already in company records.',score:2,feedback:'That independent route can verify the request.',effect:'The real supplier denies making the change.'},
    {text:'Ask the sender to email the number again.',score:1,feedback:'That does not make it independent.',effect:'The sender provides the same number.'}
   ]},
   {title:'Finance needs a decision',prompt:'The payment deadline is in an hour.',skill:'contain',weight:1.6,options:[
    {text:'Pause only the bank-detail change while verification continues.',score:2,feedback:'You protect the payment without discarding the whole workflow.',effect:'Finance prepares the verified payment route.'},
    {text:'Approve the change to avoid delay.',score:0,feedback:'Speed does not replace verification.',effect:'The payment goes to the wrong account.'},
    {text:'Cancel all supplier payments indefinitely.',score:1,feedback:'That is broader than the known risk.',effect:'Other legitimate payments stall.'}
   ]},
   {title:'Tell the team what to do',prompt:'Another manager has the same email.',skill:'communicate',weight:1.0,options:[
    {text:'“Use the original supplier contact; hold bank changes until verified.”',score:2,feedback:'The instruction is specific and actionable.',effect:'The second payment is held safely.'},
    {text:'“Be careful out there.”',score:1,feedback:'The warning lacks a concrete action.',effect:'The other manager asks what to check.'},
    {text:'Forward the suspicious email as proof.',score:0,feedback:'That can spread unsafe links or attachments.',effect:'The message reaches more inboxes.'}
   ]}
  ],
  [
   {title:'The contractor asks for a shortcut',prompt:'They say full access would save an hour.',skill:'access',weight:1.8,options:[
    {text:'Give full access for the whole month.',score:0,feedback:'The scope and duration exceed the task.',effect:'Unrelated client folders become accessible.'},
    {text:'Grant the one folder until the task ends tomorrow.',score:2,feedback:'The access matches the work and has an end date.',effect:'The fix proceeds without broad exposure.'},
    {text:'Let a colleague share their own login.',score:0,feedback:'Shared credentials make actions hard to trace.',effect:'The audit cannot tell who changed a file.'}
   ]}
  ]
 ],
 analyst:[
  [],
  [
   {title:'The owner is asleep',prompt:'What would strengthen the login finding before you brief Maya?',skill:'verify',weight:1.5,options:[
    {text:'Check the device and recent session details.',score:2,feedback:'Those records can support or challenge the account-risk theory.',effect:'The unfamiliar device matches the new session.'},
    {text:'Assume the location alone proves a breach.',score:0,feedback:'Location data can be imprecise.',effect:'The team reaches a conclusion too early.'},
    {text:'Wait for the owner to wake up before checking records.',score:1,feedback:'Their input helps, but available records can be checked now.',effect:'The session remains active longer.'}
   ]},
   {title:'A session token remains valid',prompt:'Changing a password may not end every active session.',skill:'contain',weight:1.8,options:[
    {text:'Revoke active sessions as part of containment.',score:2,feedback:'That closes the live route into the account.',effect:'The unfamiliar session stops.'},
    {text:'Only change the display name.',score:0,feedback:'That does not affect access.',effect:'The session continues.'},
    {text:'Change the password and assume all sessions ended.',score:1,feedback:'Some sessions may remain until revoked.',effect:'The team finds the lingering session later.'}
   ]},
   {title:'The account opened a folder',prompt:'The record shows a folder view, but no confirmed download.',skill:'communicate',weight:1.2,options:[
    {text:'Tell Alex every file was copied.',score:0,feedback:'The record supports access, not a confirmed copy.',effect:'Leadership receives an overstated impact.'},
    {text:'Say there was no exposure at all.',score:0,feedback:'The folder view still matters.',effect:'The risk is understated.'},
    {text:'Say the folder was accessed and downloads are still being checked.',score:2,feedback:'That is precise about both the fact and uncertainty.',effect:'Alex gives the client a measured update.'}
   ]}
  ],
  [
   {title:'The link appeared in search',prompt:'A cached preview shows the folder name online.',skill:'spot',weight:1.2,options:[
    {text:'Check whether the link was public and when it changed.',score:2,feedback:'Permission history gives the exposure window.',effect:'The team narrows the time frame.'},
    {text:'The preview proves every file was downloaded.',score:0,feedback:'A preview does not prove downloads.',effect:'The impact is overstated.'},
    {text:'Ignore the preview because it is cached.',score:1,feedback:'It may still point to a past public state.',effect:'The exposure window remains unclear.'}
   ]},
   {title:'An unfamiliar visitor appears',prompt:'The access log has a visitor ID but no name.',skill:'verify',weight:1.7,options:[
    {text:'Call it the attacker in the report.',score:0,feedback:'The identity is not established.',effect:'The report makes an unsupported attribution.'},
    {text:'Correlate the visitor with file-level access records.',score:2,feedback:'That can show what was actually opened.',effect:'The team identifies a narrower set of affected files.'},
    {text:'Delete the visitor record.',score:0,feedback:'That removes useful evidence.',effect:'The team loses the access trail.'}
   ]},
   {title:'The owner asks to delete the folder',prompt:'The public link is still active.',skill:'contain',weight:1.7,options:[
    {text:'Restrict sharing first and keep the access history.',score:2,feedback:'New access stops and the record remains.',effect:'The team can investigate the exposure.'},
    {text:'Wait until tomorrow to change access.',score:0,feedback:'More visitors can open the folder.',effect:'Another download appears.'},
    {text:'Delete everything immediately.',score:1,feedback:'The link stops, but useful history may be lost.',effect:'The team struggles to scope impact.'}
   ]},
   {title:'Prepare the first client update',prompt:'You know the link was public, but are still checking file views.',skill:'communicate',weight:1.3,options:[
    {text:'“The entire folder was stolen.”',score:0,feedback:'That claim is not supported yet.',effect:'The client receives an inaccurate statement.'},
    {text:'“We restricted the link and are checking which files were viewed.”',score:2,feedback:'This gives the action and the remaining question.',effect:'The client understands the next update.'},
    {text:'“There is nothing to report.”',score:0,feedback:'The public link is a relevant event.',effect:'The client is left unaware.'}
   ]}
  ]
 ]
};
