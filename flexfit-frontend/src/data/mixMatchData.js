// Styling intelligence for the Virtual Mix & Match Studio.
// The garment catalog is now 100% sourced from the backend — no hardcoded
// products, no hardcoded curated presets. This file only provides the
// outfit harmony analysis used by OutfitIntelligence.

/**
 * Compute styling harmony score and fashion advice.
 *
 * @param {Array} canvasGarments - items currently on the canvas
 * @param {Array} fullCatalog    - the complete wardrobe the user can pick from
 *                                 (used to build "pairs well with" suggestions)
 */
export const analyzeOutfitHarmony = (canvasGarments = [], fullCatalog = []) => {
    // ── Empty canvas: suggest the first few catalog items as starters ──
    if (!canvasGarments.length) {
        return {
            score: 0,
            status: 'Empty Canvas',
            grade: 'Start Styling',
            advice: 'Drag garments from your wardrobe to begin building your outfit.',
            colors: [],
            missingEssentials: ['Top or Dress', 'Bottom (if top)', 'Footwear'],
            pairSuggestions: fullCatalog.slice(0, 4),
        };
    }

    const categories = new Set(canvasGarments.map((g) => g.category));
    const hasTop = categories.has('Tops');
    const hasBottom = categories.has('Bottoms');
    const hasDress = categories.has('Dresses');
    const hasFootwear = categories.has('Footwear');
    const hasOuterwear = categories.has('Outerwear');
    const hasAccessory = categories.has('Accessories');

    let baseScore = 60;
    const missing = [];

    // Core clothing completeness
    if (hasDress) {
        baseScore += 20; // dress covers top + bottom
    } else {
        if (hasTop && hasBottom) baseScore += 20;
        else if (hasTop) missing.push('Bottoms (pants, skirt, or jeans)');
        else if (hasBottom) missing.push('Tops (shirt, t-shirt, or knitwear)');
        else missing.push('Top or Dress');
    }

    // Footwear check
    if (hasFootwear) baseScore += 10;
    else missing.push('Footwear (boots, sneakers, or loafers)');

    // Layering / accessory bonuses
    if (hasOuterwear) baseScore += 5;
    if (hasAccessory) baseScore += 5;

    // Cap the score
    const finalScore = Math.min(99, Math.max(50, baseScore));

    // Determine status, grade, and coaching advice
    let status = 'Good Foundation';
    let grade = 'Styling In Progress';
    let advice =
        'You have a solid base! Add complementary footwear or accessories to complete the look.';

    if (finalScore >= 95) {
        status = 'Flawless Ensemble';
        grade = 'Stylist Approved ✨';
        advice = 'Remarkable balance of silhouette, textures, and color coordination!';
    } else if (finalScore >= 85) {
        status = 'Great Balance';
        grade = 'Well Coordinated';
        advice =
            'Strong cohesive outfit. Add a statement accessory or outer layer for extra depth.';
    } else if (missing.length > 0) {
        advice = `Consider adding: ${missing[0]} to finalize this look.`;
    }

    // Active color palette (name only — hex resolution happens in the UI)
    const activeColors = canvasGarments.map((g) => {
        const selectedColor = g.selectedColor || g.colors?.[0] || 'Default';
        return {
            name: selectedColor,
            garment: g.name,
        };
    });

    // Suggest complementary items from the full catalog, prioritising
    // categories the outfit is currently missing
    const currentIds = new Set(canvasGarments.map((g) => g._id));
    const complementary = fullCatalog
        .filter((g) => {
            if (currentIds.has(g._id)) return false;
            if (!hasFootwear && g.category === 'Footwear') return true;
            if (!hasBottom && !hasDress && g.category === 'Bottoms') return true;
            if (!hasTop && !hasDress && g.category === 'Tops') return true;
            if (!hasOuterwear && g.category === 'Outerwear') return true;
            if (!hasAccessory && g.category === 'Accessories') return true;
            return false;
        })
        .slice(0, 4);

    return {
        score: finalScore,
        status,
        grade,
        advice,
        colors: activeColors,
        missingEssentials: missing,
        pairSuggestions: complementary,
    };
};