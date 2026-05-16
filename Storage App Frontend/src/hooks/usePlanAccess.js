import { useState, useEffect } from 'react';
import { PLAN_FEATURES } from '../utils/planFeatures';

// A simple global cache to avoid refetching /user multiple times
let cachedUser = null;
let userPromise = null;

export const usePlanAccess = (featureName) => {
    const [plan, setPlan] = useState(cachedUser?.plan || 'free');
    const [loading, setLoading] = useState(!cachedUser);

    useEffect(() => {
        if (cachedUser) {
            setPlan(cachedUser.plan || 'free');
            setLoading(false);
            return;
        }

        if (!userPromise) {
            userPromise = fetch(`${import.meta.env.VITE_BASE_URL}/user/`, { credentials: 'include' })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) cachedUser = data;
                    return data;
                })
                .catch(() => null);
        }

        userPromise.then(data => {
            setPlan(data?.plan || 'free');
            setLoading(false);
        });
    }, []);

    const hasAccess = PLAN_FEATURES[plan.toLowerCase()]?.[featureName] ?? false;
    const limit = PLAN_FEATURES[plan.toLowerCase()] ?? {};

    return { hasAccess, loading, plan, limit };
};
