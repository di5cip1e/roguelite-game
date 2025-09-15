// js/data.js
// Contains all the static, predefined data for the game like class abilities, enemy types, etc.

export const diceTypes = {
  d4: { sides: 4, name: "four-sided die", uses: "Small weapons, minor healing" },
  d6: { sides: 6, name: "six-sided die", uses: "Medium weapons, common spells" },
  d8: { sides: 8, name: "eight-sided die", uses: "Larger weapons, moderate healing" },
  d10: { sides: 10, name: "ten-sided die", uses: "Heavy weapons, significant damage" },
  d12: { sides: 12, name: "twelve-sided die", uses: "Great weapons, powerful spells" },
  d20: { sides: 20, name: "twenty-sided die", uses: "Attack rolls, skill checks" },
  d100: { sides: 100, name: "percentile dice", uses: "Random tables, percentile chances" }
};

export const classAbilities = {
  rogue: [
    {
      name: "Shadow Step",
      description: "Teleport behind an enemy for a guaranteed critical strike",
      icon: "👥",
      cooldown: "Once per combat",
      usable: true,
      buttonClass: "rogueAbilityBtn",
      effect: "teleportBehindEnemy"
    },
    {
      name: "Poison Blade",
      description: "Coat your blade with poison, dealing damage over time",
      icon: "🧪",
      cooldown: "Twice per day",
      usable: true,
      buttonClass: "rogueAbilityBtn",
      effect: "applyPoison"
    },
    {
      name: "Pickpocket",
      description: "Attempt to steal items or gold from NPCs",
      icon: "💰",
      cooldown: "As needed",
      usable: true,
      buttonClass: "rogueAbilityBtn",
      effect: "stealItem"
    }
  ],
  occultist: [
    {
      name: "Eldritch Blast",
      description: "Fire a beam of chaotic energy at your target",
      icon: "✨",
      cooldown: "Every combat turn",
      usable: true,
      buttonClass: "occultistAbilityBtn",
      effect: "eldritchBlast"
    },
    {
      name: "Summon Tentacles",
      description: "Call forth tentacles from another dimension to grapple enemies",
      icon: "🦑",
      cooldown: "Once per combat",
      usable: true,
      buttonClass: "occultistAbilityBtn",
      effect: "summonTentacles"
    },
    {
      name: "Dark Pact",
      description: "Sacrifice health to enhance your next spell's power",
      icon: "🔮",
      cooldown: "Twice per day",
      usable: true,
      buttonClass: "occultistAbilityBtn",
      effect: "darkPact"
    }
  ],
  amazon: [
    {
      name: "Battle Cry",
      description: "Intimidate enemies and empower allies with a mighty shout",
      icon: "📢",
      cooldown: "Once per combat",
      usable: true,
      buttonClass: "amazonAbilityBtn",
      effect: "battleCry"
    },
    {
      name: "Power Attack",
      description: "Perform a devastating attack that ignores armor",
      icon: "🪓",
      cooldown: "Three times per day",
      usable: true,
      buttonClass: "amazonAbilityBtn",
      effect: "powerAttack"
    },
    {
      name: "Shield Wall",
      description: "Take a defensive stance, greatly reducing incoming damage",
      icon: "🛡️",
      cooldown: "Every combat turn",
      usable: true,
      buttonClass: "amazonAbilityBtn",
      effect: "shieldWall"
    }
  ],
  necromancer: [
    {
      name: "Life Drain",
      description: "Steal life essence from an enemy to heal yourself",
      icon: "💀",
      cooldown: "Every combat turn",
      usable: true,
      buttonClass: "necromancerAbilityBtn",
      effect: "lifeDrain"
    },
    {
      name: "Raise Skeleton",
      description: "Summon an undead minion to fight for you",
      icon: "☠️",
      cooldown: "Once per combat",
      usable: true,
      buttonClass: "necromancerAbilityBtn",
      effect: "raiseSkeleton"
    },
    {
      name: "Soul Harvest",
      description: "Collect souls from fallen enemies to empower your next spell",
      icon: "👻",
      cooldown: "Passive",
      usable: false,
      buttonClass: "necromancerAbilityBtn",
      effect: "soulHarvest"
    }
  ]
};

export const talentEffects = {
  "quick-reflexes": {
    name: "Quick Reflexes",
    description: "Provides +25% dodge chance and initiative bonus",
    icon: "quickReflexesTalent",
    effect: function(context) {
      if (context === "combat" && Math.random() < 0.25) {
        return {dodged: true, message: "Your quick reflexes allow you to dodge the attack!"};
      }
      return {dodged: false};
    }
  },
  "sixth-sense": {
    name: "Sixth Sense",
    description: "75% chance to detect traps and ambushes",
    icon: "sixthSenseTalent",
    effect: function(context) {
      if (context === "trap" && Math.random() < 0.75) {
        return {detected: true, message: "Your sixth sense warns you of imminent danger!"};
      }
      return {detected: false};
    }
  },
  "iron-will": {
    name: "Iron Will",
    description: "Auto-stabilize once when below 15% health",
    icon: "ironWillTalent",
    usedInCombat: false,
    effect: function(context) {
      if (context === "combat" && 
          characterStats.health < (characterStats.maxHealth * 0.15) && 
          !this.usedInCombat) {
        this.usedInCombat = true;
        const healAmount = Math.floor(characterStats.maxHealth * 0.3);
        characterStats.health += healAmount;
        return {
          activated: true, 
          healAmount: healAmount,
          message: "Your iron will allows you to keep fighting despite grievous wounds!"
        };
      }
      return {activated: false};
    },
    reset: function() {
      this.usedInCombat = false;
    }
  },
  "lucky": {
    name: "Lucky",
    description: "15% chance to automatically succeed on any check",
    icon: "luckyTalent",
    effect: function(context) {
      if (Math.random() < 0.15) {
        return {lucky: true, message: "Fortune smiles upon you at just the right moment!"};
      }
      return {lucky: false};
    }
  }
};

export const enemyTemplates = {
  goblin: {
    name: "Goblin", health: 30, maxHealth: 30, damage: 5, defense: 2, speed: 7, special: "Frenzy",
    specialDescription: "Performs two quick attacks with reduced damage",
    imagePrompt: "Fantasy goblin warrior with crude weapons, ugly face, green skin, game style"
  },
  bandit: {
    name: "Bandit", health: 45, maxHealth: 45, damage: 7, defense: 4, speed: 6, special: "Dirty Trick",
    specialDescription: "Reduces player's defense temporarily",
    imagePrompt: "Masked bandit with leather armor and daggers, menacing pose, fantasy game style"
  },
  skeleton: {
    name: "Skeleton Warrior", health: 40, maxHealth: 40, damage: 8, defense: 2, speed: 4, special: "Bone Shield",
    specialDescription: "Blocks the next attack completely",
    imagePrompt: "Undead skeleton warrior with rusty sword and shield, glowing eyes, fantasy game style"
  },
  witch: {
    name: "Swamp Witch", health: 35, maxHealth: 35, damage: 10, defense: 1, speed: 5, special: "Hex",
    specialDescription: "Causes damage over time for 3 turns",
    imagePrompt: "Evil witch with staff, dark robes, glowing magic, fantasy game style"
  },
  troll: {
    name: "Cave Troll", health: 70, maxHealth: 70, damage: 12, defense: 5, speed: 3, special: "Regeneration",
    specialDescription: "Recovers health each turn",
    imagePrompt: "Massive cave troll with stone club, tough skin, fantasy game style"
  }
};

export const npcTemplates = {
  merchant: {
    name: "Dalmar the Merchant", attitude: "neutral", portrait: "merchant",
    description: "A shrewd trader with goods from across the realm",
    dialogues: {
      greeting: {
        text: "Welcome to my humble shop, traveler! Looking to buy or sell?",
        choices: [
          { text: "I'd like to see your wares.", nextNode: "shop" },
          { text: "What news from the road?", nextNode: "news" },
          { text: "I'll be on my way.", nextNode: "farewell" }
        ]
      },
      shop: {
        text: "I've got weapons, potions, and curiosities from across the realm. What interests you?",
        choices: [
          { text: "Show me your weapons.", nextNode: "weapons", impact: "shop" },
          { text: "I need healing potions.", nextNode: "potions", impact: "shop" },
          { text: "Any rare items?", nextNode: "rare", impact: "shop" },
          { text: "Nothing today, thanks.", nextNode: "farewell" }
        ]
      },
      news: {
        text: "The northern roads are perilous these days. Bandits have been attacking travelers, and there are whispers of darker things lurking in the forests.",
        choices: [
          { text: "Tell me more about these bandits.", nextNode: "bandits", impact: "knowledge" },
          { text: "What darker things?", nextNode: "darker", impact: "knowledge" },
          { text: "Let's talk about something else.", nextNode: "greeting" }
        ]
      },
      farewell: {
        text: "Safe travels, friend. May fortune smile upon your path.",
        choices: [{ text: "Goodbye.", nextNode: "end" }]
      },
      weapons: {
        text: "I have a fine selection of blades and bows. This steel sword is particularly fine - forged in the fires of the Blackrock Mountains.",
        choices: [
          { text: "I'll take the steel sword. (15 gold)", nextNode: "buy_sword", impact: "purchase" },
          { text: "Show me the bows instead.", nextNode: "bows", impact: "shop" },
          { text: "Let me see something else.", nextNode: "shop" }
        ]
      },
      potions: {
        text: "Healing potions, fresh from the alchemist's guild! The small will restore 25 health for 10 gold, while the large will restore 50 health for 20 gold.",
        choices: [
          { text: "I'll take a small healing potion.", nextNode: "buy_small_potion", impact: "purchase" },
          { text: "I'll take a large healing potion.", nextNode: "buy_large_potion", impact: "purchase" },
          { text: "Let me see something else.", nextNode: "shop" }
        ]
      },
      bandits: {
        text: "They call themselves the Red Fangs. Led by a brute named Goran. They've set up camp somewhere in the northern forests and prey on anyone traveling the trade routes.",
        choices: [
          { text: "Are there any bounties for these bandits?", nextNode: "bounty", impact: "quest" },
          { text: "I'll be careful. Tell me about the 'darker things'.", nextNode: "darker", impact: "knowledge" },
          { text: "Let's talk about something else.", nextNode: "greeting" }
        ]
      }
    }
  },
  innkeeper: {
    name: "Eliza the Innkeeper", attitude: "friendly", portrait: "innkeeper",
    description: "A warm-hearted woman who runs the local tavern",
    dialogues: { /* ... content collapsed for brevity ... */ }
  },
  mystic: {
    name: "Zephyr the Mystic", attitude: "neutral", portrait: "mystic",
    description: "A mysterious seer with knowledge of arcane matters",
    dialogues: { /* ... content collapsed for brevity ... */ }
  },
  guard: {
    name: "Captain Thorne", attitude: "unfriendly", portrait: "guard",
    description: "A stern captain of the city watch",
    dialogues: { /* ... content collapsed for brevity ... */ }
  },
  beggar: {
    name: "Old Finn", attitude: "neutral", portrait: "beggar",
    description: "A ragged beggar with one eye and surprising knowledge",
    dialogues: { /* ... content collapsed for brevity ... */ }
  },
  witch: {
    name: "Morgana the Witch", attitude: "neutral", portrait: "witch",
    description: "A mysterious witch living in a secluded hut",
    dialogues: { /* ... content collapsed for brevity ... */ }
  },
  stranger: {
    name: "Mysterious Stranger", attitude: "neutral", portrait: "stranger",
    description: "A cloaked figure shrouded in mystery",
    dialogues: { /* ... content collapsed for brevity ... */ }
  },
  cultist: {
    name: "Robed Cultist", attitude: "hostile", portrait: "cultist",
    description: "A member of a dark cult, initially disguised as a normal citizen",
    dialogues: { /* ... content collapsed for brevity ... */ }
  },
  blacksmith: {
    name: "Hagar the Blacksmith", attitude: "friendly", portrait: "blacksmith",
    description: "A burly blacksmith with a friendly demeanor",
    dialogues: { /* ... content collapsed for brevity ... */ }
  }
};

export const difficultySettings = {
  "whimp": { healthMod: 1.5, damageReceived: 0.6, rewardChance: 1.5, rollBonus: 2, choiceCount: 5, description: "You journey as a whimp, with fate smiling upon you." },
  "novice": { healthMod: 1.2, damageReceived: 0.8, rewardChance: 1.2, rollBonus: 1, choiceCount: 5, description: "You venture forth as a novice, the path ahead forgiving." },
  "adventurer": { healthMod: 1.0, damageReceived: 1.0, rewardChance: 1.0, rollBonus: 0, choiceCount: 4, description: "You travel as an adventurer, facing balanced challenges." },
  "veteran": { healthMod: 0.8, damageReceived: 1.3, rewardChance: 1.4, rollBonus: -1, choiceCount: 3, description: "You stand as a veteran, facing greater dangers for greater rewards." },
  "madgod": { healthMod: 0.6, damageReceived: 1.8, rewardChance: 2.0, rollBonus: -2, choiceCount: 3, description: "You challenge the gods themselves. Death lurks at every turn." }
};