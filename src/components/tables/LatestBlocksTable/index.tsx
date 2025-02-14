import { PAGE_SIZE, headerTooltip } from './config';
import { Skeleton } from './components/Skeleton';
import { TableLayout } from '../components/Table';
import { HeaderTooltip } from '../components/HeaderTooltip';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useSearchInput } from '@/hooks/useSearchInput';
import { addEthSuffix, shortenEthAddress } from '@/utils/web3';
import { toFixedNoTrailingZeros } from '@/utils/decimals';
import { getBeaconChainExplorer } from '@/utils/config';
import { getSlotUnixTime } from '@/utils/slotsTime';
import type { Block } from '../types';

const columnHelper = createColumnHelper<Block>();

const getRelativeTimeFromSlot = (slot: number) => {
  const slotTimestamp = getSlotUnixTime(slot);

  // Calculate the difference between current time and the slot time
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const timeDifference = currentTime - slotTimestamp;

  // Convert time difference to human-readable format
  const minutes = Math.floor(timeDifference / 60);
  const seconds = timeDifference % 60;
  const hours = Math.floor(timeDifference / 3600);
  const days = Math.floor(timeDifference / 86400);

  if (days > 0) {
    const remainingHours = Math.floor((timeDifference % 86400) / 3600);
    const dayStr = days === 1 ? 'day' : 'days';
    const hourStr = remainingHours === 1 ? 'hour' : 'hours';
    return `${days} ${dayStr} ${remainingHours} ${hourStr} ago`;
  }

  if (hours > 0) {
    const hourStr = hours === 1 ? 'hour' : 'hours';
    return `${hours} ${hourStr} ago`;
  }

  if (minutes > 0) {
    const minuteStr = minutes === 1 ? 'minute' : 'minutes';
    return `${minutes} ${minuteStr} ago`;
  }

  return `${seconds} seconds ago`;
};

const getAbsoluteTimeFromSlot = (slot: number) => {
  const genesisUnixTime = 1606824023; // Unix time of the genesis block
  const slotDurationSeconds = 12; // Duration for each slot in seconds

  // Calculate the timestamp for the given slot
  const slotTimestamp = genesisUnixTime + slot * slotDurationSeconds;

  // Create a Date object using the calculated timestamp
  const absoluteDate = new Date(slotTimestamp * 1000);

  // Return the formatted absolute date in local time
  return absoluteDate.toLocaleString();
};

const getColumns = (blackExplorerUrl?: string) => [
  columnHelper.accessor('slot', {
    header: ({ column }) => <HeaderTooltip column={column} header="Slot" tooltip={headerTooltip.slot} />,
    cell: (info) => {
      const slot = info.getValue();
      return (
        <Link
          className="font-medium underline"
          href={getBeaconChainExplorer('slot', slot)}
          rel="noopener noreferrer"
          target="_blank">
          {slot.toLocaleString()}
        </Link>
      );
    },
    enableSorting: true,
  }),
  columnHelper.accessor('date', {
    // Adding the 'date' column
    header: () => <HeaderTooltip header="Date" tooltip={headerTooltip.date} />,
    cell: (info) => {
      const slot = info.row.original.slot;
      const relativeTime = getRelativeTimeFromSlot(slot);
      const absoluteTime = getAbsoluteTimeFromSlot(slot); // Function for absolute time

      return (
        <span title={absoluteTime}>{relativeTime}</span> // Display relative time with title as absolute time
      );
    },
  }),
  columnHelper.accessor('proposer', {
    header: () => (
      <HeaderTooltip header="Proposer" tooltip={headerTooltip.proposer} />
    ),
    cell: (info) => {
      const proposer = info.getValue();
      return (
        <Link
          className="font-medium underline"
          href={`${blackExplorerUrl}/validator/${proposer.validatorIndex}`}
          rel="noopener noreferrer"
          target="_blank">
          {shortenEthAddress(proposer.validatorKey.toLocaleString())}
        </Link>
      );
    },
  }),
  columnHelper.accessor('rewardType', {
    header: () => (<HeaderTooltip header="Reward Type" tooltip={headerTooltip.rewardType} />),
    cell: (info) => {
      const rewardType = info.getValue();
      let modifiedRewardType: string = rewardType;

      // Replace "vanila" with "vanilla" if it exists in the rewardType
      modifiedRewardType = modifiedRewardType.replace('vanila', 'vanilla');
      const displayRewardType =
        modifiedRewardType === 'unknownrewardtype' ? '-' : modifiedRewardType;
      return displayRewardType;
    },
  }),

  columnHelper.accessor('reward', {
    header: ({ column }) => (<HeaderTooltip column={column} header="Reward" tooltip={headerTooltip.reward} />),
    cell: (info) => addEthSuffix(toFixedNoTrailingZeros(info.getValue(), 4)),
  }),
  columnHelper.accessor('blockType', {
    header: () => <HeaderTooltip header="Block Type" />,
    cell: (info) => {
      const blockType = info.getValue();
      const formattedBlockType =
        blockType === 'okpoolproposal'
          ? 'Proposed'
          : blockType === 'missedproposal'
          ? 'Missed'
          : blockType === 'okpoolproposalblskeys'
          ? 'Invalid (BLS)'
          : 'Wrong Fee';
      return formattedBlockType;
    },
    enableSorting: true,
  }),
];

interface LatestBlocksTableProps {
  blockExplorerUrl?: string;
  data?: Block[];
  isLoading: boolean;
}

export function LatestBlocksTable({
  blockExplorerUrl,
  data,
  isLoading,
}: LatestBlocksTableProps) {
  const [filterValue, setFilterValue] = useState<string>(
    filterOptions[0].value
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  const { searchInput, setSearchInput, debouncedSearchInput } =
    useSearchInput();

  const filteredData = useMemo(
    () =>
      data
        ?.filter((row) => {
          const validatorKey = row.proposer.validatorKey.toLowerCase();
          const search = debouncedSearchInput.toLowerCase();
          return (
            validatorKey.includes(search) &&
            (row.blockType === filterValue || filterValue === 'all')
          );
        })
        .sort((a, b) => b.slot - a.slot),
    [debouncedSearchInput, filterValue, data]
  );

  const table = useReactTable({
    columns: getColumns(blockExplorerUrl),
    data: filteredData ?? [],
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(), 
  });

  if (isLoading) return <Skeleton title="Latest Smooth Blocks" />;

  return (
    <TableLayout
      hasFilter
      className="h-[510px]"
      data={filteredData ?? []}
      filterOptions={filterOptions}
      filterTitle="Block Type"
      filterValue={filterValue}
      searchInput={searchInput}
      searchPlaceholder="Search Proposer"
      setFilterValue={setFilterValue}
      setSearchInput={setSearchInput}
      table={table}
      title="Latest Smooth Blocks"
    />
  );
}

const filterOptions = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Proposed',
    value: 'okpoolproposal',
  },
  {
    label: 'Invalid(BLS)',
    value: 'okpoolproposalblskeys',
  },
  {
    label: 'Wrong Fee',
    value: 'wrongfeerecipient',
  },
  {
    label: 'Missed',
    value: 'missedproposal',
  },
];
