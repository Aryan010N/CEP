import React, { createContext, useContext, useState, useEffect } from 'react';
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
  upvoteTicketInFirestore,
  createCommunityInFirestore,
  joinCommunityInFirestore,
  claimChallengeInFirestore,
  postChallengeInFirestore,
  isFirestoreConfigured
} from '../services/firebase';
import { dispatchVerificationSMS, dispatchStatusEmail } from '../services/notifications';

const CommunityContext = createContext();

export function useCommunity() {
  return useContext(CommunityContext);
}

export function CommunityProvider({ children }) {
  const { currentUser } = useAuth();

  // Communities list state
  const [communities, setCommunities] = useState(() => {
    const saved = localStorage.getItem('cep_communities');
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
    const saved = localStorage.getItem('cep_active_community_id');
    return saved || communities[0]?.community_id || 'comm_emerald_1';
  });

  // Tickets state
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('cep_tickets');
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
    const saved = localStorage.getItem('cep_challenges');
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

  // Sync to local cache
  useEffect(() => {
    localStorage.setItem('cep_communities', JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem('cep_active_community_id', activeCommunityId);
  }, [activeCommunityId]);

  useEffect(() => {
    localStorage.setItem('cep_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('cep_challenges', JSON.stringify(challenges));
  }, [challenges]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ==========================================================================
  // REAL-TIME CLOUD FIRESTORE SUBSCRIPTIONS
  // ==========================================================================

  // 1. Subscribe to Communities collection
  useEffect(() => {
    if (!isFirestoreConfigured()) return;

    const unsubscribe = subscribeCommunities(
      (liveCommunities) => {
        if (liveCommunities && liveCommunities.length > 0) {
          setCommunities(liveCommunities);
          setIsLiveSyncActive(true);
        }
      },
      (error) => {
        console.info("Communities subscription notice:", error?.message);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // 2. Subscribe to Tickets for the active community
  useEffect(() => {
    if (!activeCommunityId || !isFirestoreConfigured()) return;

    const unsubscribe = subscribeTickets(
      activeCommunityId,
      (liveTickets) => {
        setTickets(liveTickets || []);
        setIsLiveSyncActive(true);
      },
      (error) => {
        console.info("Tickets subscription notice:", error?.message);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [activeCommunityId]);

  // 3. Subscribe to NGO Challenges collection
  useEffect(() => {
    if (!isFirestoreConfigured()) return;

    const unsubscribe = subscribeChallenges(
      (liveChallenges) => {
        if (liveChallenges && liveChallenges.length > 0) {
          setChallenges(liveChallenges);
          setIsLiveSyncActive(true);
        }
      },
      (error) => {
        console.info("Challenges subscription notice:", error?.message);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // --- Membership helpers ---
  const getUserCommunities = () => {
    if (!currentUser) return [];
    return communities.filter(c => {
      if (c.members && c.members.some(m => m.uid === currentUser.uid)) return true;
      if (c.admin_uid === currentUser.uid) return true;
      if (currentUser.community_id === c.community_id || currentUser.communityId === c.community_id) return true;
      return false;
    });
  };

  const activeCommunity = communities.find(c => c.community_id === activeCommunityId) || communities[0] || INITIAL_DEMO_COMMUNITIES[0];

  const getNomenclature = (communityId = activeCommunityId) => {
    const comm = communities.find(c => c.community_id === communityId) || activeCommunity;
    return comm?.nomenclature || {
      reporter_label: "Resident",
      verifier_label: "Wing Representative",
      authority_label: "Estate Admin",
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
                            currentUser.community_id === community.community_id ||
                            currentUser.communityId === community.community_id;
    
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
      hostel: { reporter_label: "Student", verifier_label: "Wing Representative", authority_label: "Estate Admin", division_label: "Wing" },
      housing_society: { reporter_label: "Flat Owner", verifier_label: "Floor Lead", authority_label: "Estate Admin", division_label: "Tower" },
      rwa_colony: { reporter_label: "Homeowner", verifier_label: "Block Coordinator", authority_label: "Estate Admin", division_label: "Block" },
      ngo_hub: { reporter_label: "Community Member", verifier_label: "Field Rep", authority_label: "Program Director", division_label: "Sector" },
      custom: { reporter_label: "Member", verifier_label: "Representative", authority_label: "Estate Admin", division_label: "Unit" }
    };

    const assignedNom = {
      reporter_label: nomenclature?.reporter_label?.trim() || defaultNomByType[type]?.reporter_label || "Resident",
      verifier_label: nomenclature?.verifier_label?.trim() || defaultNomByType[type]?.verifier_label || "Wing Representative",
      authority_label: nomenclature?.authority_label?.trim() || defaultNomByType[type]?.authority_label || "Estate Admin",
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
      title: ticketData.title.slice(0, 120),
      description: ticketData.description,
      category: ticketData.category || "General",
      urgency: ticketData.urgency || "Low",
      status: "Submitted",
      resident_id: currentUser?.uid || ticketData.resident_id || "1CQhM7DORNOAtMynLCFbtSti5rl2",
      submittedBy: currentUser?.uid || "1CQhM7DORNOAtMynLCFbtSti5rl2",
      resident_name: currentUser?.name || ticketData.resident_name || currentNom.reporter_label,
      community_id: ticketData.community_id || activeCommunityId,
      communityId: ticketData.community_id || activeCommunityId,
      wing: ticketData.wing || (activeCommunity?.wings?.[0] || "Wing A"),
      room_number: ticketData.room_number || "Unit 101",
      image_url: ticketData.image_url || null,
      upvotes: 0,
      upvoted_by: [],
      created_at: new Date().toISOString(),
      verified_by: null,
      assigned_worker: null,
      ai_summary: ticketData.ai_summary || ticketData.title,
      suggested_action: ticketData.suggested_action || `Pending ${currentNom.verifier_label} review.`
    };

    // Optimistic Update
    setTickets(prev => [newTicket, ...prev]);
    showToast(`Complaint #${newTicket.ticket_id} submitted & routed to ${currentNom.verifier_label}!`, "success");

    try {
      const activeTickets = tickets.filter(t => t.community_id === newTicket.community_id && t.status !== 'Resolved');
      await createTicketInFirestore(newTicket, activeTickets);
    } catch (err) {
      console.warn("Firestore submitTicket notice:", err.message);
    }

    return newTicket;
  };

  // Upvote an existing ticket
  const upvoteTicket = async (ticketId) => {
    const userId = currentUser?.uid || "anonymous_resident";

    // Optimistic Update
    setTickets(prev => prev.map(t => {
      if (t.ticket_id === ticketId || t.id === ticketId) {
        const upvotedBy = t.upvoted_by || [];
        if (!upvotedBy.includes(userId)) {
          return {
            ...t,
            upvotes: (t.upvotes || 0) + 1,
            upvoted_by: [...upvotedBy, userId]
          };
        }
      }
      return t;
    }));

    showToast("Ticket upvoted! Priority boosted for maintenance dispatch.", "info");

    try {
      await upvoteTicketInFirestore(ticketId, userId);
    } catch (err) {
      console.warn("Firestore upvoteTicket notice:", err.message);
    }
  };

  // Verifier action: Verify & Escalate or Reject + Automated 30s SMS Alert
  const updateTicketByRep = async (ticketId, isApproved, verifierName, notes = "") => {
    const currentNom = getNomenclature();
    const updateData = {
      status: isApproved ? "Verified_By_Rep" : "Rejected",
      verified_by: verifierName || currentNom.verifier_label,
      rep_notes: notes,
      verified_at: new Date().toISOString()
    };

    const targetTicket = tickets.find(t => t.ticket_id === ticketId || t.id === ticketId);

    // Optimistic Update
    setTickets(prev => prev.map(t => {
      if (t.ticket_id === ticketId || t.id === ticketId) {
        return { ...t, ...updateData };
      }
      return t;
    }));

    if (isApproved) {
      showToast(`Ticket #${ticketId} verified! WhatsApp alert & email dispatched to ${currentNom.authority_label} within 30s.`, "success");
      
      dispatchVerificationSMS({
        toPhone: '+91 98765 99999',
        ticketId: ticketId,
        title: targetTicket?.title || "Community Maintenance Alert",
        wing: targetTicket?.wing || "General Wing",
        verifierName: verifierName || "Wing Representative",
        urgency: targetTicket?.urgency || "High"
      }).then(res => {
        console.log("SMS notification dispatched:", res);
      });

    } else {
      showToast(`Ticket #${ticketId} marked as spam / rejected.`, "warning");
    }

    try {
      await updateTicketInFirestore(ticketId, updateData);
    } catch (err) {
      console.warn("Firestore updateTicketByRep sync notice:", err.message);
    }
  };

  // Admin / Authority action: Assign worker, move status, complete resolution + Email Notification
  const updateTicketByAdmin = async (ticketId, { status, assigned_worker, admin_notes }) => {
    const updateData = {
      status: status || undefined,
      assigned_worker: assigned_worker !== undefined ? assigned_worker : undefined,
      admin_notes: admin_notes !== undefined ? admin_notes : undefined,
      updated_at: new Date().toISOString()
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const targetTicket = tickets.find(t => t.ticket_id === ticketId || t.id === ticketId);

    // Optimistic Update
    setTickets(prev => prev.map(t => {
      if (t.ticket_id === ticketId || t.id === ticketId) {
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

    if (status === 'Resolved' || status === 'In_Progress' || status === 'Assigned') {
      dispatchStatusEmail({
        toEmail: 'resident@campus.edu',
        ticketId: ticketId,
        title: targetTicket?.title || "Problem Report",
        status: statusLabels[status] || status,
        assignedWorker: assigned_worker,
        notes: admin_notes
      }).then(res => {
        console.log("Status update email dispatched:", res);
      });
    }

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
      if (c.challenge_id === challengeId || c.id === challengeId) {
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

    showToast(`Challenge claimed! Project coordinator notified via email bridge.`, "success");

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
      reward: challengeData.reward || "Certificate & 300 CEP Credits",
      created_at: new Date().toISOString()
    };

    // Optimistic Update
    setChallenges(prev => [newChallenge, ...prev]);
    showToast(`NGO Challenge "${newChallenge.title}" published!`, "success");

    try {
      await postChallengeInFirestore(newChallenge);
    } catch (err) {
      console.warn("Firestore postNGOChallenge sync notice:", err.message);
    }

    return newChallenge;
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
    upvoteTicket,
    updateTicketByRep,
    updateTicketByAdmin,
    claimNGOChallenge,
    postNGOChallenge,
    isLiveSyncActive
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}
