import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject, OmeggaPlayer, WeaponClass} from 'omegga';

type Config = { foo: string };

const colorGreen = "<color=\"0ccf00\">";
const colorYellow = "<color=\"00ffff\">";
const colorRed = "<color=\"ff3303\">";

const weaponsList: WeaponClass[] = ['Weapon_Pistol',"Weapon_Revolver","Weapon_HighPowerPistol",'Weapon_MagnumPistol','Weapon_AssaultRifle','Weapon_ServiceRifle',"Weapon_LightMachineGun","Weapon_MicroSMG",'Weapon_BullpupSMG','Weapon_HeavyAssaultRifle','Weapon_Minigun','Weapon_AntiMaterielRifle','Weapon_Bow','Weapon_FlintlockPistol','Weapon_Battleaxe','Weapon_Zweihander','Weapon_Knife']

let scoresForRound: number[]=[];

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  async init() {
    const minigameEvents = await this.omegga.getPlugin('minigameevents')
    if (minigameEvents) {
      console.log('subscribing to minigameevents')
      minigameEvents.emitPlugin('subscribe',[]);
    } else {
      throw Error("minigameevents plugin is required for this to plugin")
    }
    return { registeredCommands: [''] };
  }

  async stop() {
    // Unsubscribe to the death events plugin
    const minigameEvents = await this.omegga.getPlugin('minigameevents')
    if (minigameEvents) {
      console.log('unsubscribing from minigameevents')
      minigameEvents.emitPlugin('unsubscribe',[])
    } else {
      throw Error("minigameevents plugin is required for this to plugin")
    }
  }

  
  async pluginEvent(event: string, from: string, ...args: any[]) {
    console.log(event, from, args)
    if (event === 'roundend') {
      const [{ name }] = args;
      scoresForRound=[];
      this.omegga.broadcast(`${name} has ended.`)
    }

    if (event === 'roundchange') {
      const [{ name }] = args;
      scoresForRound=[];
      this.omegga.broadcast(`${name} has reset.`);
    }

    if (event === 'joinminigame') {
      const [{ player, minigame }] = args;
      if (player && minigame) {
        scoresForRound[player.name]=0;
        let playerinst = this.omegga.getPlayer(player.name);
        let next = weaponsList[0];
        if(next){
          playerinst.giveItem(next)         
        }
      }
    }

    if (event === 'leaveminigame') {
      const [{ player, minigame }] = args;
      if (player && minigame) {
        scoresForRound[player.name]=0;
      }
    }

    if (event === 'score') {
      const [{ player, leaderboard,minigame }] = args;
      if (player) {
        let score = scoresForRound[player.name];
        let playerinst = this.omegga.getPlayer(player.name);
        playerinst.takeItem(weaponsList[score])
        score++;
        let next = weaponsList[score];
        if(next){
          playerinst.giveItem(next)          
        }else{
          this.omegga.nextRoundMinigame(0);
        }
        this.omegga.broadcast(`${player.name} has won!`);
      }
    }

    if (event === 'kill') {
      const [{ player, leaderboard }] = args;
      if (player) {

      }
    }
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
