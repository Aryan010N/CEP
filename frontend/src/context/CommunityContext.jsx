import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_DEMO_TICKETS, 
  INITIAL_DEMO_COMMUNITIES, 
  INITIAL_DEMO_CHALLENGES 
} from '../services/firebase';

const CommunityContext = createContext();

export function useCommunity() {
  return useContext(CommunityContext);
}

export function CommunityProvider({ children }) {
  // Communities list state
  const [communities, setCommunities] = useState(() => {
    const saved = localStorage.getItem('cep_communities_v2');
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
    const saved = localStorage.getItem('cep_active_community_id_v2');
    return saved || communities[0]?.community_id || 'comm_emerald_1';
  });

  // Tickets state
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('cep_tickets_v2');
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
    const saved = localStorage.getItem('cep_challenges_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load stored challenges", e);
      }
    }
    return INITIAL_DEMO_CHALLENGES;
  });

  // Toast state
  const [toast, setToast] = useState(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('cep_communities_v2', JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem('cep_active_community_id_v2', activeCommunityId);
  }, [activeCommunityId]);

  useEffect(() => {
    localStorage.setItem('cep_tickets_v2', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('cep_challenges_v2', JSON.stringify(challenges));
  }, [challenges]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const activeCommunity = communities.find(c => c.community_id === activeCommunityId) || communities[0] || INITIAL_DEMO_COMMUNITIES[0];

  // Get dynamic custom role names for any community
  const getNomenclature = (communityId = activeCommunityId) => {
    const comm = communities.find(c => c.community_id === communityId) || activeCommunity;
    return comm?.nomenclature || {
      reporter_label: "Resident",
      verifier_label: "Wing Representative",
      authority_label: "Warden / Admin",
      division_label: "Wing"
    };
  };

  // Register / Add a Brand New Community
  const createCommunity = ({ name, type, city, wings, nomenclature }) => {
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
      admin_uid: `admin_${Date.now()}`,
      nomenclature: assignedNom,
      created_at: new Date().toISOString()
    };

    setCommunities(prev => [newCommunity, ...prev]);
    setActiveCommunityId(newCommunity.community_id);
    showToast(`Community "${newCommunity.name}" created & set as active!`, "success");
    return newCommunity;
  };

  // Submit a new ticket (with photo / image support)
  const submitTicket = (ticketData) => {
    const currentNom = getNomenclature(ticketData.community_id || activeCommunityId);

    const newTicket = {
      ticket_id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category || "General",
      urgency: ticketData.urgency || "Low",
      status: "Submitted",
      resident_id: ticketData.resident_id || "usr_resident_1",
      resident_name: ticketData.resident_name || currentNom.reporter_label,
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

    setTickets(prev => [newTicket, ...prev]);
    showToast(`Complaint #${newTicket.ticket_id} submitted & routed to ${currentNom.verifier_label}!`, "success");
    return newTicket;
  };

  // Verifier action: Verify & Escalate or Reject
  const updateTicketByRep = (ticketId, isApproved, verifierName, notes = "") => {
    const currentNom = getNomenclature();
    setTickets(prev => prev.map(t => {
      if (t.ticket_id === ticketId) {
        return {
          ...t,
          status: isApproved ? "Verified_By_Rep" : "Rejected",
          verified_by: verifierName || currentNom.verifier_label,
          rep_notes: notes,
          verified_at: new Date().toISOString()
        };
      }
      return t;
    }));

    if (isApproved) {
      showToast(`Ticket #${ticketId} verified & escalated to ${currentNom.authority_label}!`, "success");
    } else {
      showToast(`Ticket #${ticketId} marked as spam / rejected.`, "warning");
    }
  };

  // Admin / Authority action: Assign worker, move status, complete resolution
  const updateTicketByAdmin = (ticketId, { status, assigned_worker, admin_notes }) => {
    setTickets(prev => prev.map(t => {
      if (t.ticket_id === ticketId) {
        return {
          ...t,
          status: status || t.status,
          assigned_worker: assigned_worker !== undefined ? assigned_worker : t.assigned_worker,
          admin_notes: admin_notes !== undefined ? admin_notes : t.admin_notes,
          updated_at: new Date().toISOString()
        };
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
  };

  // Student claim NGO challenge
  const claimNGOChallenge = (challengeId, studentUserId, studentName) => {
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
  };

  // Post new NGO challenge
  const postNGOChallenge = (challengeData) => {
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

    setChallenges(prev => [newChallenge, ...prev]);
    showToast(`NGO Challenge "${newChallenge.title}" published!`, "success");
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
    resetToDemoDefaults
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}
