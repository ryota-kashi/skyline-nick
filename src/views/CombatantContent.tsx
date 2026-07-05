import { memo, useCallback } from 'react';

import { CombatantData, LimitBreakData } from '@/api';
import * as jobIcons from '@/assets/jobs';
import { useAppSelector } from '@/hooks';
import { fmtNumber } from '@/utils/formatters';
import { BottomDispMapKey, MAP_DISPLAY_CONTENT } from '@/utils/maps';
import { isCombatantData, isLimitBreakData } from '@/utils/type';

interface CombatantContentProps {
  player: CombatantData | LimitBreakData;
  color: string;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
  lockDetail: boolean;
  setLockDetail: React.Dispatch<React.SetStateAction<boolean>>;
}

function CombatantContent({
  player,
  color,
  setShowDetail,
  lockDetail,
  setLockDetail,
}: CombatantContentProps) {
  const dispMode = useAppSelector((state) => state.settings.dispMode);
  const dispContent = useAppSelector((state) => state.settings.dispContent);
  const shortNumber = useAppSelector((state) => state.settings.shortNumber);
  const contentDisp = useAppSelector((state) => state.settings.contentDisp);
  const showContentDivider = useAppSelector((state) => state.settings.showContentDivider);

  const leftDisp = (player as CombatantData)[dispContent.left] || 0;
  const leftDispUnit = MAP_DISPLAY_CONTENT[dispContent.left].data.unit;
  const rightDisp = (player as CombatantData)[dispContent.right] || 0;
  const rightDispUnit = MAP_DISPLAY_CONTENT[dispContent.right].data.unit;

  // max hit / max heal display (whichever is non-zero)
  const maxHitDamage = isCombatantData(player) ? player.maxHitDamage : player.damage;
  const maxHealDamage = isCombatantData(player) ? player.maxHealDamage : player.healed;
  const maxHitName = maxHitDamage ? player.maxHit : maxHealDamage ? player.maxHeal : '';
  const maxHitValue = maxHitDamage || maxHealDamage;

  // detail controls controllers
  const onDetailEnter = useCallback(() => {
    setShowDetail(true);
  }, [setShowDetail]);
  const onDetailLeave = useCallback(() => {
    !lockDetail && setShowDetail(false);
  }, [lockDetail, setShowDetail]);
  const onSwitchDetailLock = useCallback(() => setLockDetail((val) => !val), [setLockDetail]);

  // job icon component
  const Icon = isLimitBreakData(player)
    ? jobIcons.FFXIV
    : jobIcons[String.prototype.toUpperCase.apply(player.job) as keyof typeof jobIcons] ||
      jobIcons.FFXIV;

  // renders one of the selectable extra content rows
  const renderContentExtra = (kind: BottomDispMapKey) => {
    if (kind === 'maxhit' && maxHitName) {
      return (
        <div className='combatant-content-maxhit'>
          <span>{maxHitName}</span>
          {maxHitValue > 0 && <span>-&nbsp;{fmtNumber(maxHitValue, shortNumber)}</span>}
        </div>
      );
    }
    if (kind === 'last60DPS' && isCombatantData(player)) {
      return (
        <div className='combatant-content-recentdps'>
          <span className='combatant-content-recentdps-label'>60s</span>
          <span className='combatant-content-recentdps-value'>
            {fmtNumber(player.last60DPS, shortNumber)}
          </span>
        </div>
      );
    }
    if (kind === 'cdpcts' && isCombatantData(player)) {
      const { directHitPct, critHitPct, directCritHitPct } = player;
      return (
        <div className='combatant-content-cdpcts'>
          <span>{directCritHitPct}CD</span>
          <span>{critHitPct}C</span>
          <span>{directHitPct}D</span>
        </div>
      );
    }
    if (kind === 'cdpcts-reverse' && isCombatantData(player)) {
      const { directHitPct, critHitPct, directCritHitPct } = player;
      return (
        <div className='combatant-content-cdpcts'>
          <span>{directHitPct}D</span>
          <span>{critHitPct}C</span>
          <span>{directCritHitPct}CD</span>
        </div>
      );
    }
    if (kind === 'damagePctDeaths' && isCombatantData(player)) {
      const { damagePct, deaths } = player;
      return (
        <div className='combatant-content-cdpcts'>
          <span>{damagePct || '0%'}DMG</span>
          <span>{deaths}DT</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className='combatant-content'
      onMouseEnter={onDetailEnter}
      onMouseLeave={onDetailLeave}
      onClick={onSwitchDetailLock}
      style={{ backgroundColor: color }}
    >
      <div className='combatant-content-row'>
        {dispMode === 'dual' && (
          <div className='combatant-content-data'>
            <span className='g-number'>
              {(typeof leftDisp === 'number' && fmtNumber(leftDisp, shortNumber)) || leftDisp}
            </span>
            <span className='g-counter'>{leftDispUnit}</span>
          </div>
        )}
        <span className='job-icon'>
          <Icon />
        </span>
        <div className='combatant-content-data'>
          <span className='g-number'>
            {(typeof rightDisp === 'number' && fmtNumber(rightDisp, shortNumber)) || rightDisp}
          </span>
          <span className='g-counter'>{rightDispUnit}</span>
        </div>
      </div>
      {showContentDivider && <div className='combatant-content-divider' />}
      {renderContentExtra(contentDisp.row1)}
      {renderContentExtra(contentDisp.row2)}
    </div>
  );
}

export default memo(CombatantContent);
