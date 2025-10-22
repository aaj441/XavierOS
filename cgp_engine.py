"""
CGP Archetype Engine
Care archetypes for personalized wellness and ritual experiences
"""

from typing import Dict, List, Optional
from pydantic import BaseModel
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class ArchetypeData(BaseModel):
    """Data structure for a single archetype"""
    narrative: str
    tone: str
    values: List[str]
    risks: List[str]
    features: List[str]
    ritual: str
    audio: Optional[str] = None


class ArchetypeProfile(BaseModel):
    """Complete archetype profile with metadata"""
    name: str
    data: ArchetypeData
    pdf_available: bool = False


class ArchetypeRecommendation(BaseModel):
    """Archetype recommendation based on user input"""
    archetype_name: str
    confidence: float  # 0-1
    reasoning: str


class UserArchetypeProfile(BaseModel):
    """User's selected archetype and preferences"""
    primary_archetype: str
    secondary_archetype: Optional[str] = None
    custom_ritual: Optional[str] = None
    preferences: Dict[str, any] = {}


class CGPArchetypeEngine:
    """
    CGP Archetype Engine

    Manages care archetypes for personalized wellness experiences.
    Integrates with Lucy (WCAG) and Project X (eBook) to provide
    archetype-specific content and rituals.
    """

    def __init__(self, vault_path: str = "archetype_prompt_vault_waltz4.json"):
        self.vault_path = vault_path
        self.archetypes: Dict[str, ArchetypeData] = {}
        self.load_archetypes()

    def load_archetypes(self):
        """Load archetype data from JSON vault"""
        try:
            with open(self.vault_path, 'r') as f:
                data = json.load(f)
                self.archetypes = {
                    name: ArchetypeData(**archetype_data)
                    for name, archetype_data in data.items()
                }
            logger.info(f"Loaded {len(self.archetypes)} archetypes from {self.vault_path}")
        except Exception as e:
            logger.error(f"Error loading archetypes: {e}")
            raise

    def get_all_archetypes(self) -> List[ArchetypeProfile]:
        """Get all available archetypes"""
        profiles = []
        for name, data in self.archetypes.items():
            # Check if PDF exists
            pdf_path = Path(f"{name}.pdf")
            profiles.append(ArchetypeProfile(
                name=name,
                data=data,
                pdf_available=pdf_path.exists()
            ))
        return profiles

    def get_archetype(self, name: str) -> Optional[ArchetypeProfile]:
        """Get specific archetype by name"""
        if name not in self.archetypes:
            return None

        pdf_path = Path(f"{name}.pdf")
        return ArchetypeProfile(
            name=name,
            data=self.archetypes[name],
            pdf_available=pdf_path.exists()
        )

    def get_archetype_names(self) -> List[str]:
        """Get list of all archetype names"""
        return list(self.archetypes.keys())

    def recommend_archetype(
        self,
        current_state: str,
        concerns: List[str],
        preferences: Dict[str, any]
    ) -> List[ArchetypeRecommendation]:
        """
        Recommend archetypes based on user input

        Args:
            current_state: User's current emotional/care state
            concerns: List of user concerns or needs
            preferences: User preferences (privacy, support level, etc.)

        Returns:
            List of recommended archetypes with confidence scores
        """
        recommendations = []

        # Simple rule-based recommendation system
        # Can be enhanced with ML/AI in the future

        state_lower = current_state.lower()
        concerns_lower = [c.lower() for c in concerns]

        # Griefwalker - for those dealing with loss, burnout
        if any(word in state_lower for word in ['grief', 'loss', 'burnout', 'tired', 'overwhelmed']):
            recommendations.append(ArchetypeRecommendation(
                archetype_name="Griefwalker",
                confidence=0.9,
                reasoning="You seem to need gentleness and rest. Griefwalker offers soothing support without overwhelming you."
            ))

        # Fighter - for those facing systemic challenges
        if any(word in concerns_lower for word in ['denied', 'appeal', 'fight', 'injustice', 'delayed']):
            recommendations.append(ArchetypeRecommendation(
                archetype_name="Fighter",
                confidence=0.85,
                reasoning="You're facing obstacles that need advocacy. Fighter provides tools to push back and get heard."
            ))

        # Self-Protector - for those needing boundaries
        if any(word in concerns_lower for word in ['privacy', 'overwhelm', 'boundary', 'space', 'intrusion']):
            recommendations.append(ArchetypeRecommendation(
                archetype_name="Self-Protector",
                confidence=0.88,
                reasoning="You value your space and boundaries. Self-Protector respects your need for calm and privacy."
            ))

        # Seeker - for curious explorers
        if any(word in concerns_lower for word in ['explore', 'options', 'curious', 'wellness', 'holistic']):
            recommendations.append(ArchetypeRecommendation(
                archetype_name="Seeker",
                confidence=0.82,
                reasoning="You're open to exploration and new possibilities. Seeker gives you freedom to discover."
            ))

        # Solo Architect - for independent planners
        if any(word in concerns_lower for word in ['clarity', 'simple', 'transparent', 'data', 'efficient']):
            recommendations.append(ArchetypeRecommendation(
                archetype_name="Solo Architect",
                confidence=0.87,
                reasoning="You prefer clear, efficient systems. Solo Architect offers minimalist, transparent care."
            ))

        # Connector - for caregivers and community-oriented
        if any(word in concerns_lower for word in ['caregiver', 'community', 'family', 'support network']):
            recommendations.append(ArchetypeRecommendation(
                archetype_name="Connector",
                confidence=0.86,
                reasoning="You care for others and value community. Connector helps you support your network."
            ))

        # Nurturer - for those seeking holistic healing
        if any(word in concerns_lower for word in ['healing', 'integrative', 'spiritual', 'wholeness', 'mental health']):
            recommendations.append(ArchetypeRecommendation(
                archetype_name="Nurturer",
                confidence=0.84,
                reasoning="You're seeking holistic care. Nurturer integrates physical, mental, and spiritual wellness."
            ))

        # Default recommendation if none match
        if not recommendations:
            recommendations.append(ArchetypeRecommendation(
                archetype_name="Nurturer",
                confidence=0.6,
                reasoning="Starting with Nurturer provides a balanced approach to care while you explore your needs."
            ))

        # Sort by confidence
        recommendations.sort(key=lambda x: x.confidence, reverse=True)

        return recommendations

    def get_ritual_for_archetype(self, archetype_name: str) -> Optional[str]:
        """Get the ritual text for a specific archetype"""
        archetype = self.archetypes.get(archetype_name)
        if archetype:
            return archetype.ritual
        return None

    def get_archetype_values(self, archetype_name: str) -> Optional[List[str]]:
        """Get the values for a specific archetype"""
        archetype = self.archetypes.get(archetype_name)
        if archetype:
            return archetype.values
        return None

    def generate_archetype_report(self, archetype_name: str) -> Optional[Dict]:
        """
        Generate a comprehensive report for an archetype

        Includes all data plus suggestions for integration with
        Lucy (accessibility) and Project X (eBook generation)
        """
        archetype = self.get_archetype(archetype_name)
        if not archetype:
            return None

        return {
            "archetype": archetype_name,
            "profile": archetype.dict(),
            "ritual_guidance": {
                "daily_practice": archetype.data.ritual,
                "recommended_frequency": "Daily, preferably morning or evening",
                "duration": "5-10 minutes"
            },
            "integration_suggestions": {
                "lucy_wcag": "Ensure ritual content is accessible with proper ARIA labels and alt text",
                "project_x_ebook": f"Generate personalized {archetype_name} ritual guide as eBook",
                "sound_therapy": f"Pair with {archetype.data.tone}-themed soundscapes"
            },
            "related_archetypes": self._get_related_archetypes(archetype_name)
        }

    def _get_related_archetypes(self, archetype_name: str) -> List[str]:
        """
        Get related archetypes based on shared values or complementary tones
        """
        current = self.archetypes.get(archetype_name)
        if not current:
            return []

        related = []
        for name, archetype in self.archetypes.items():
            if name == archetype_name:
                continue

            # Check for shared values
            shared_values = set(current.values) & set(archetype.values)
            if shared_values:
                related.append(name)

        return related[:3]  # Return top 3 related

    def create_custom_ritual(
        self,
        base_archetype: str,
        custom_text: str,
        additional_values: List[str] = []
    ) -> Dict:
        """
        Create a custom ritual based on an archetype

        Allows users to personalize their ritual while maintaining
        archetype foundation
        """
        base = self.archetypes.get(base_archetype)
        if not base:
            raise ValueError(f"Archetype {base_archetype} not found")

        return {
            "base_archetype": base_archetype,
            "custom_ritual": custom_text,
            "values": list(set(base.values + additional_values)),
            "tone": base.tone,
            "original_ritual": base.ritual
        }


# Convenience functions for API use
def get_all_archetypes() -> List[ArchetypeProfile]:
    """Get all available archetypes"""
    engine = CGPArchetypeEngine()
    return engine.get_all_archetypes()


def get_archetype(name: str) -> Optional[ArchetypeProfile]:
    """Get specific archetype by name"""
    engine = CGPArchetypeEngine()
    return engine.get_archetype(name)


def recommend_archetype(
    current_state: str,
    concerns: List[str],
    preferences: Dict[str, any]
) -> List[ArchetypeRecommendation]:
    """Recommend archetypes based on user input"""
    engine = CGPArchetypeEngine()
    return engine.recommend_archetype(current_state, concerns, preferences)
