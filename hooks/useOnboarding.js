import { useState, useEffect, useCallback } from 'react';
import { ONBOARDING_STEPS } from '@/components/onboarding/onboarding-steps';
import { apiFetch } from '@/lib/api';

const STORAGE_KEY = 'bk_onboarding';

function getStoredState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredState(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useOnboarding(hotelId, role, isAdmin) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  // completedSteps: Set of step IDs
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [rawData, setRawData] = useState(null);

  // Compute filtered steps dynamically based on role
  const filteredSteps = ONBOARDING_STEPS.filter(step => {
    // If the step has allowedRoles and the user has a role, check if it's allowed.
    // If no role is provided (e.g., just started loading), or if they are platform admin, we could show all.
    // However, if they are an explicit role, we filter.
    if (!step.allowedRoles) return true; // fallback if undefined
    if (!role && !isAdmin) return true; // show all by default until role resolves, or maybe hide? Let's show.
    return step.allowedRoles.includes(role) || isAdmin;
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getStoredState();
    if (stored) {
      setCompletedSteps(new Set(stored.completedSteps || []));
      setDismissed(stored.dismissed || false);
      setCurrentStep(stored.currentStep || 0);
    }
    setLoaded(true);
  }, []);

  // Auto-open if not dismissed and setup incomplete (on first hotel load)
  useEffect(() => {
    if (!loaded || !hotelId || dismissed) return;
    const stored = getStoredState();
    const hotelKey = `hotelId_${hotelId}`;
    // Only auto-open once per hotel
    if (!stored?.autoOpenedFor?.includes(hotelKey)) {
      setIsOpen(true);
      const newStored = {
        ...stored,
        autoOpenedFor: [...(stored?.autoOpenedFor || []), hotelKey],
      };
      saveStoredState(newStored);
    }
  }, [loaded, hotelId, dismissed]);

  // Check completion status from live API data
  const checkCompletionFromHotelData = useCallback((hotelData, roomTypesData, roomsData, staffData, bookingsData, ratePlansData) => {
    const completed = new Set();
    
    setRawData({
      hotel: hotelData,
      roomTypes: roomTypesData,
      rooms: roomsData,
      staff: staffData,
      bookings: bookingsData,
      ratePlans: ratePlansData
    });

    // Step 1: hotel-setup — has logo and address
    if (hotelData?.logoUrl && hotelData?.address) {
      completed.add('hotel-setup');
    }
    // Step 2: room-types — at least 1 room type
    if (Array.isArray(roomTypesData) && roomTypesData.length > 0) {
      completed.add('room-types');
    }
    // Step 3: rooms — at least 1 room
    if (Array.isArray(roomsData) && roomsData.length > 0) {
      completed.add('rooms');
    }
    // Step 4: rate-plans — has at least 1 rate plan
    if (Array.isArray(ratePlansData) && ratePlansData.length > 0) {
      completed.add('rate-plans');
    }
    // Step 5: payment-setup — has at least 1 payment method configured
    if (hotelData?.bankAccountNumber || hotelData?.promptPayId || hotelData?.stripePublicKey || hotelData?.omisePublicKey) {
      completed.add('payment-setup');
    }
    // Step 6: add-staff (optional) — has at least 1 staff member
    if (Array.isArray(staffData) && staffData.length > 0) {
      completed.add('add-staff');
    }
    // Step 7: first-booking — has at least 1 booking
    if (Array.isArray(bookingsData) && bookingsData.length > 0) {
      completed.add('first-booking');
    }

    setCompletedSteps(completed);

    // Persist merged with current storage
    const stored = getStoredState() || {};
    saveStoredState({
      ...stored,
      completedSteps: [...completed],
    });
  }, []);

  // Fetch data to refresh checklists when guide is opened
  useEffect(() => {
    if (!isOpen || !hotelId) return;

    let isMounted = true;
    const fetchOnboardingData = async () => {
      try {
        const [hotelData, roomTypesData, roomsData, staffData, bookingsData, ratePlansData] = await Promise.allSettled([
          apiFetch(`/hotels/${hotelId}`),
          apiFetch(`/room-types?hotelId=${hotelId}`),
          apiFetch(`/rooms?hotelId=${hotelId}`),
          apiFetch(`/staff?hotelId=${hotelId}`),
          apiFetch(`/bookings?hotelId=${hotelId}&limit=10`),
          apiFetch(`/rates/plans?hotelId=${hotelId}`)
        ]);

        if (isMounted) {
          checkCompletionFromHotelData(
            hotelData.value,
            roomTypesData.value?.data || roomTypesData.value,
            roomsData.value?.data || roomsData.value,
            staffData.value?.data || staffData.value,
            bookingsData.value?.data || bookingsData.value,
            ratePlansData.value?.data || ratePlansData.value
          );
        }
      } catch (error) {
        // silently ignore fetch errors for onboarding guide
      }
    };

    fetchOnboardingData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, hotelId, checkCompletionFromHotelData]);

  const markStepComplete = useCallback((stepId) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(stepId);
      const stored = getStoredState() || {};
      saveStoredState({
        ...stored,
        completedSteps: [...next],
        currentStep,
      });
      return next;
    });
  }, [currentStep]);

  const goToStep = useCallback((index) => {
    setCurrentStep(index);
    const stored = getStoredState() || {};
    saveStoredState({ ...stored, currentStep: index });
  }, []);

  const goNext = useCallback(() => {
    const next = Math.min(currentStep + 1, filteredSteps.length - 1);
    goToStep(next);
  }, [currentStep, goToStep, filteredSteps.length]);

  const goPrev = useCallback(() => {
    const prev = Math.max(currentStep - 1, 0);
    goToStep(prev);
  }, [currentStep, goToStep]);

  const openGuide = useCallback(() => setIsOpen(true), []);

  const closeGuide = useCallback(() => {
    setIsOpen(false);
    setDismissed(true);
    const stored = getStoredState() || {};
    saveStoredState({ ...stored, dismissed: true });
  }, []);

  const resetGuide = useCallback(() => {
    setCompletedSteps(new Set());
    setCurrentStep(0);
    setDismissed(false);
    setIsOpen(true);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalSteps = filteredSteps.length;
  // Make sure we only count completed steps that are in our filtered list
  const completedCount = filteredSteps.filter(s => completedSteps.has(s.id)).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 100;
  const allDone = totalSteps > 0 && completedCount >= totalSteps;
  const isStepComplete = (stepId) => completedSteps.has(stepId);

  return {
    isOpen,
    openGuide,
    closeGuide,
    resetGuide,
    currentStep,
    goToStep,
    goNext,
    goPrev,
    completedSteps,
    markStepComplete,
    checkCompletionFromHotelData,
    progressPercent,
    completedCount,
    totalSteps,
    allDone,
    isStepComplete,
    rawData,
    filteredSteps,
    hotelId,
  };
}
