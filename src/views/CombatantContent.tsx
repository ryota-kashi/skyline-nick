import { memo, useCallback } from 'react';

import { CombatantData, LimitBreakData } from '@/api';
import * as jobIcons from '@/assets/jobs';
import { useAppSelector } from '@/hooks';
import { fmtNumber } from '@/utils/formatters';
import { ContentDispMapKey, MAP_DISPLAY_CONTENT } from '@/utils/maps';
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

  // renders one of the selectable extra content rows (max hit / recent dps / none)
  const renderContentExtra = (kind: ContentDispMapKey) => {
    if (kind === 'maxhit' && maxHitName) {
      return (
        <div className='combatant-content-maxhit'>
          <span>{maxHitName}</span>
          {maxHitValue > 0 && <span>-&nbsp;{fmtNumber(maxHitValue, shortNumber)}</span>}
        </div>
      );
    }
    if (kind === 'recentdps' && isCombatantData(player)) {
      return (
        <div className='combatant-content-recentdps'>
          <span className='combatant-content-recentdps-label'>60s</span>
          <span className='combatant-content-recentdps-value'>
            {fmtNumber(player.last60DPS, shortNumber)}
          </span>
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
