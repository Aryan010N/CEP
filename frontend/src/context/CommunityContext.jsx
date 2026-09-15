import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { 
  INITIAL_DEMO_TICKETS, 
  INITIAL_DEMO_COMMUNITIES, 
  INITIAL_DEMO_CHALLENGES,
  subscribeTickets,
  subscribeCommunities,
  subscribeChallenges,
  createTicketInFirestore,
  updateTicketInFirestore,
  createCommunityInFirestore,
  joinCommunityInFirestore,
  claimChallengeInFirestore,
  postChallengeInFirestore,
  isFirestoreConfigured
} from '../services/firebase';

const CommunityContext = createContext();

export function useCommunity() {
  return useContext(CommunityContext);
}

export function CommunityProvider({ children }) {
  const { currentUser, isDemoMode } = useAuth();

  // Communities list state
  const [communities, setCommunities] = useState(() => {
    const saved = localStorage.getItem('cep_communities_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load stored communities", e);
      }
    }
    return INITIAL_DEMO_COMMUNITIES;
  });

  const [activeCommunityId, setActiveCommunityId] = useState(() => {
    const saved = localStorage.getItem('cep_active_community_id_v3');
    return saved || communities[0]?.community_id || 'comm_emerald_1';
  });

  // Tickets state
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('cep_tickets_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load stored tickets", e);
      }
    }
    return INITIAL_DEMO_TICKETS;
  });

  // NGO Challenges state
  const [challenges, setChallenges] = useState(() => {
    const saved = localStorage.getItem('cep_challenges_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load stored challenges", e);
      }
    }
    return INITIAL_DEMO_CHALLENGES;
  });

  const [toast, setToast] = useState(null);
  const [isLiveSyncActive, setIsLiveSyncActive] = useState(false);

  // Backup cache in localStorage
  useEffect(() => {
    localStorage.setItem('cep_communities_v3', JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem('cep_active_community_id_v3', activeCommunityId);
  }, [activeCommunityId]);

  useEffect(() => {
    localStorage.setItem('cep_tickets_v3', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('cep_challenges_v3', JSON.stringify(challenges));
  }, [challenges]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ==========================================================================
  // REAL-TIME CLOUD FIRESTORE SUBSCRIPTIONS (Strict Unsubscribe Enforcement)
  // ==========================================================================

  // 1. Subscribe to Communities collection
  useEffect(() => {
    if (!isFirestoreConfigured() && isDemoMode) {
      return;
    }

    const unsubscribe = subscribeCommunities(
      (liveCommunities) => {
        if (liveCommunities && liveCommunities.length > 0) {
          setCommunities(liveCommunities);
          setIsLiveSyncActive(true);
        }
      },
      (error) => {
        console.info("Operating in local demo mode fallback for communities.", error?.message);
      }
    );

    // STRICT LIFECYCLE RULE: Unsubscribe on unmount to prevent memory leaks
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isDemoMode]);

  // 2. Subscribe to Tickets for the active community
  useEffect(() => {
    if (!activeCommunityId) {
      return;
    }

    if (!isFirestoreConfigured() && isDemoMode) {
      return;
    }

    const unsubscribe = subscribeTickets(
      activeCommunityId,
      (liveTickets) => {
        if (liveTickets && liveTickets.length > 0) {
          setTickets(liveTickets);
          setIsLiveSyncActive(true);
        }
      },
      (error) => {
        console.info("Operating in local demo mode fallback for tickets.", error?.message);
      }
    );

    // STRICT LIFECYCLE RULE: Unsubscribe on unmount or when activeCommunityId changes
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [activeCommunityId, isDemoMode]);

  // 3. Subscribe to NGO Challenges collection
  useEffect(() => {
    if (!isFirestoreConfigured() && isDemoMode) {
      return;
    }

    const unsubscribe = subscribeChallenges(
      (liveChallenges) => {
        if (liveChallenges && liveChallenges.length > 0) {
          setChallenges(liveChallenges);
          setIsLiveSyncActive(true);
        }
      },
      (error) => {
        console.info("Operating in local demo mode fallback for challenges.", error?.message);
      }
    );

    // STRICT LIFECYCLE RULE: Unsubscribe on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isDemoMode]);

  // --- Membership helpers ---
  const DEMO_COMMUNITY_IDS = ['comm_emerald_1', 'comm_palmgrove_2', 'comm_greenwoods_3'];

  const getUserCommunities = () => {
    if (!currentUser) return [];
    return communities.filter(c => {
      if (isDemoMode && DEMO_COMMUNITY_IDS.includes(c.community_id)) return true;
      if (c.members && c.members.some(m => m.uid === currentUser.uid)) return true;
      if (c.admin_uid === currentUser.uid) return true;
      if (currentUser.community_id === c.community_id) return true;
      return false;
    });
  };

  const activeCommunity = communities.find(c => c.community_id === activeCommunityId) || communities[0] || INITIAL_DEMO_COMMUNITIES[0];

  const getNomenclature = (communityId = activeCommunityId) => {
    const comm = communities.find(c => c.community_id === communityId) || activeCommunity;
    return comm?.nomenclature || {
      reporter_label: "Resident",
      verifier_label: "Wing Representative",
      authority_label: "Warden / Admin",
      division_label: "Wing"
    };
  };

  // Join an existing community
  const joinCommunity = async (communityId) => {
    if (!currentUser) {
      showToast("Please sign in to join a community.", "warning");
      return false;
    }
    
    const community = communities.find(c => c.community_id === communityId);
    if (!community) {
      showToast("Community not found. Check the invite link.", "error");
      return false;
    }

    const isAlreadyMember = community.members?.some(m => m.uid === currentUser.uid) ||
                            community.admin_uid === currentUser.uid ||
                            currentUser.community_id === community.community_id;
    
    if (isAlreadyMember) {
      setActiveCommunityId(communityId);
      showToast(`You're already a member of "${community.name}". Switched to it!`, "info");
      return true;
    }

    const newMember = {
      uid: currentUser.uid,
      name: currentUser.name,
      role: currentUser.role,
      joinedAt: new Date().toISOString()
    };

    // Optimistic Update
    setCommunities(prev => prev.map(c => {
      if (c.community_id === communityId) {
        return {
          ...c,
          members: [...(c.members || []), newMember]
        };
      }
      return c;
    }));

    setActiveCommunityId(communityId);
    showToast(`Successfully joined "${community.name}"! 🎉`, "success");

    // Async Cloud Firestore Sync
    try {
      await joinCommunityInFirestore(communityId, newMember);
    } catch (err) {
      console.warn("Firestore joinCommunity sync notice:", err.message);
    }

    return true;
  };

  const getInviteCode = (communityId = activeCommunityId) => {
    return btoa(`cep_join_${communityId}_${Date.now()}`).replace(/=/g, '');
  };

  const parseInviteCode = (code) => {
    try {
      const decoded = atob(code + '=='.slice(0, (4 - code.length % 4) % 4));
      const match = decoded.match(/^cep_join_(comm_[a-zA-Z0-9_]+)_\d+$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  // Register / Add a Brand New Community
  const createCommunity = async ({ name, type, city, wings, nomenclature }) => {
    const defaultNomByType = {
      hostel: { reporter_label: "Student", verifier_label: "Floor Captain", authority_label: "Chief Warden", division_label: "Wing" },
      housing_society: { reporter_label: "Flat Owner", verifier_label: "Floor Lead", authority_label: "Society Secretary", division_label: "Tower" },
      rwa_colony: { reporter_label: "Homeowner", verifier_label: "Block Coordinator", authority_label: "RWA President", division_label: "Block" },
      ngo_hub: { reporter_label: "Community Member", verifier_label: "Field Rep", authority_label: "Program Director", division_label: "Sector" },
      custom: { reporter_label: "Member", verifier_label: "Representative", authority_label: "Administrator", division_label: "Unit" }
    };

    const assignedNom = {
      reporter_label: nomenclature?.reporter_label?.trim() || defaultNomByType[type]?.reporter_label || "Resident",
      verifier_label: nomenclature?.verifier_label?.trim() || defaultNomByType[type]?.verifier_label || "Representative",
      authority_label: nomenclature?.authority_label?.trim() || defaultNomByType[type]?.authority_label || "Administrator",
      division_label: nomenclature?.division_label?.trim() || defaultNomByType[type]?.division_label || "Wing"
    };

    const cleanedWings = Array.isArray(wings)
      ? wings.filter(w => w && w.trim())
      : (wings || "").split(',').map(w => w.trim()).filter(Boolean);

    const newCommunity = {
      community_id: `comm_${Date.now()}`,
      name: name.trim(),
      type: type || "housing_society",
      city: city ? city.trim() : "City Center",
      wings: cleanedWings.length > 0 ? cleanedWings : ["Section 1", "Section 2", "Section 3"],
      admin_uid: currentUser?.uid || `admin_${Date.now()}`,
      nomenclature: assignedNom,
      members: currentUser ? [{
        uid: currentUser.uid,
        name: currentUser.name,
        role: 'admin',
        joinedAt: new Date().toISOString()
      }] : [],
      created_at: new Date().toISOString()
    };

    // Optimistic Update
    setCommunities(prev => [newCommunity, ...prev]);
    setActiveCommunityId(newCommunity.community_id);
    showToast(`Community "${newCommunity.name}" created & set as active!`, "success");

    // Async Cloud Firestore Sync
    try {
      await createCommunityInFirestore(newCommunity);
    } catch (err) {
      console.warn("Firestore createCommunity sync notice:", err.message);
    }

    return newCommunity;
  };

  // Submit a new ticket
  const submitTicket = async (ticketData) => {
    const currentNom = getNomenclature(ticketData.community_id || activeCommunityId);

    const newTicket = {
      ticket_id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category || "General",
      urgency: ticketData.urgency || "Low",
      status: "Submitted",
      resident_id: ticketData.resident_id || (currentUser?.uid || "usr_resident_1"),
      resident_name: ticketData.resident_name || (currentUser?.name || currentNom.reporter_label),
      community_id: ticketData.community_id || activeCommunityId,
      wing: ticketData.wing || (activeCommunity?.wings?.[0] || "Section 1"),
      room_number: ticketData.room_number || "Unit 101",
      image_url: ticketData.image_url || null,
      created_at: new Date().toISOString(),
      verified_by: null,
      assigned_worker: null,
      ai_summary: ticketData.ai_summary || ticketData.title,
      suggested_action: ticketData.suggested_action || `Pending ${currentNom.verifier_label} review.`
    };

    // Optimistic Update
    setTickets(prev => [newTicket, ...prev]);
    showToast(`Complaint #${newTicket.ticket_id} submitted & routed to ${currentNom.verifier_label}!`, "success");

    // Async Cloud Firestore Sync
    try {
      await createTicketInFirestore(newTicket);
    } catch (err) {
      console.warn("Firestore submitTicket sync notice:", err.message);
    }

    return newTicket;
  };

  // Verifier action: Verify & Escalate or Reject
  const updateTicketByRep = async (ticketId, isApproved, verifierName, notes = "") => {
    const currentNom = getNomenclature();
    const updateData = {
      status: isApproved ? "Verified_By_Rep" : "Rejected",
      verified_by: verifierName || currentNom.verifier_label,
      rep_notes: notes,
      verified_at: new Date().toISOString()
    };

    // Optimistic Update
    setTickets(prev => prev.map(t => {
      if (t.ticket_id === ticketId) {
        return { ...t, ...updateData };
      }
      return t;
    }));

    if (isApproved) {
      showToast(`Ticket #${ticketId} verified & escalated to ${currentNom.authority_label}!`, "success");
    } else {
      showToast(`Ticket #${ticketId} marked as spam / rejected.`, "warning");
    }

    // Async Cloud Firestore Sync
    try {
      await updateTicketInFirestore(ticketId, updateData);
    } catch (err) {
      console.warn("Firestore updateTicketByRep sync notice:", err.message);
    }
  };

  // Admin / Authority action: Assign worker, move status, complete resolution
  const updateTicketByAdmin = async (ticketId, { status, assigned_worker, admin_notes }) => {
    const updateData = {
      status: status || undefined,
      assigned_worker: assigned_worker !== undefined ? assigned_worker : undefined,
      admin_notes: admin_notes !== undefined ? admin_notes : undefined,
      updated_at: new Date().toISOString()
    };

    // Remove undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Optimistic Update
    setTickets(prev => prev.map(t => {
      if (t.ticket_id === ticketId) {
        return { ...t, ...updateData };
      }
      return t;
    }));

    const statusLabels = {
      Verified_By_Rep: "Verified",
      Assigned: "Assigned",
      In_Progress: "In Progress",
      Resolved: "Resolved & Closed",
      Rejected: "Rejected"
    };

    showToast(`Ticket #${ticketId} updated: ${statusLabels[status] || status}`, "success");

    // Async Cloud Firestore Sync
    try {
      await updateTicketInFirestore(ticketId, updateData);
    } catch (err) {
      console.warn("Firestore updateTicketByAdmin sync notice:", err.message);
    }
  };

  // Student claim NGO challenge
  const claimNGOChallenge = async (challengeId, studentUserId, studentName) => {
    // Optimistic Update
    setChallenges(prev => prev.map(c => {
      if (c.challenge_id === challengeId) {
        return {
          ...c,
          status: "Claimed",
          claimed_by_user_id: studentUserId,
          claimed_by_user_name: studentName,
          claimed_at: new Date().toISOString()
        };
      }
      return c;
    }));

    showToast(`Challenge claimed! Project coordinator notified.`, "success");

    // Async Cloud Firestore Sync
    try {
      await claimChallengeInFirestore(challengeId, studentUserId, studentName);
    } catch (err) {
      console.warn("Firestore claimNGOChallenge sync notice:", err.message);
    }
  };

  // Post new NGO challenge
  const postNGOChallenge = async (challengeData) => {
    const newChallenge = {
      challenge_id: `NGO-CH-${Math.floor(100 + Math.random() * 900)}`,
      ngo_name: challengeData.ngo_name,
      title: challengeData.title,
      description: challengeData.description,
      skills_required: Array.isArray(challengeData.skills_required) 
        ? challengeData.skills_required 
        : (challengeData.skills_required || "").split(',').map(s => s.trim()).filter(Boolean),
      status: "Open",
      claimed_by_user_id: null,
      claimed_by_user_name: null,
      contact_email: challengeData.contact_email,
      reward: challengeData.reward || "Social Impact Certificate",
      created_at: new Date().toISOString()
    };

    // Optimistic Update
    setChallenges(prev => [newChallenge, ...prev]);
    showToast(`NGO Challenge "${newChallenge.title}" published!`, "success");

    // Async Cloud Firestore Sync
    try {
      await postChallengeInFirestore(newChallenge);
    } catch (err) {
      console.warn("Firestore postNGOChallenge sync notice:", err.message);
    }

    return newChallenge;
  };

  // Reset to demo defaults
  const resetToDemoDefaults = () => {
    setCommunities(INITIAL_DEMO_COMMUNITIES);
    setActiveCommunityId(INITIAL_DEMO_COMMUNITIES[0].community_id);
    setTickets(INITIAL_DEMO_TICKETS);
    setChallenges(INITIAL_DEMO_CHALLENGES);
    showToast("Reset to default demonstration communities & tickets.", "info");
  };

  const value = {
    communities,
    activeCommunity,
    activeCommunityId,
    setActiveCommunityId,
    getNomenclature,
    getUserCommunities,
    joinCommunity,
    getInviteCode,
    parseInviteCode,
    createCommunity,
    tickets,
    challenges,
    toast,
    showToast,
    submitTicket,
    updateTicketByRep,
    updateTicketByAdmin,
    claimNGOChallenge,
    postNGOChallenge,
    resetToDemoDefaults,
    isLiveSyncActive
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}
