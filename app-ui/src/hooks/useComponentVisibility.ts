import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';

interface ComponentVisibility {
  id: string;
  componentKey: string;
  isVisibleToAll: boolean;
  visibleRoles: string[] | null;
}

export const useComponentVisibility = (componentKey: string) => {
  const { currentProject, userRole } = useProject();
  const [isVisible, setIsVisible] = useState(true); // Default to visible
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentProject && userRole) {
      checkVisibility();
    }
  }, [currentProject, userRole, componentKey]);

  const checkVisibility = async () => {
    if (!currentProject || !userRole) {
      setIsVisible(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.request<ComponentVisibility[]>(
        `/collab/projects/${currentProject.id}/component-visibility`
      );
      
      const componentVisibility = response.find(v => v.componentKey === componentKey);
      
      if (!componentVisibility) {
        // No custom settings = visible to all
        setIsVisible(true);
        return;
      }

      if (componentVisibility.isVisibleToAll) {
        setIsVisible(true);
        return;
      }

      // Check if user's role is in visible roles
      const visibleRoles = componentVisibility.visibleRoles || [];
      setIsVisible(visibleRoles.includes(userRole));
      
    } catch (error) {
      console.error('Failed to check component visibility:', error);
      // On error, default to visible to avoid blocking users
      setIsVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    isVisible,
    loading,
    refresh: checkVisibility,
  };
};
