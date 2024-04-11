import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
} from 'recharts'
import { useTheme } from 'next-themes'
import { useQuery } from '@tanstack/react-query'
import {
  fetchProposedBlocks,
  fetchStatistics,
} from '@/client/api/queryFunctions'
import { weiToEth } from '@/utils/web3' // Ensure this import is correct
import styles from '@/styles/stats.module.css'
import { toFixedNoTrailingZeros } from '@/utils/decimals'
import { SELECTED_CHAIN } from '@/utils/config'
import CustomTooltip from '@/components/common/ChartsTooltip'

// Utility to get Unix time for a slot
const getSlotUnixTime = (slot: number) => {
  const genesisUnixTime = SELECTED_CHAIN === 'goerli' ? 1616508000 : 1606824023
  return genesisUnixTime + slot * 12 // Each slot represents 12 seconds
}

export default function Stats() {
  const { resolvedTheme } = useTheme()

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['statistics'],
    queryFn: fetchStatistics,
  })
  const { data: proposedBlocks, isLoading: isLoadingProposedBlocks } = useQuery(
    {
      queryKey: ['proposedblocks'],
      queryFn: fetchProposedBlocks,
    }
  )

  const renderBarChart = () => {
    const data = [
      { blocks: stats?.totalProposedBlocks ?? 0, name: 'Proposed' },
      { blocks: stats?.totalWrongfeeBlocks ?? 0, name: 'Wrong Fee' },
      { blocks: stats?.totalMissedBlocks ?? 0, name: 'Missed' },
    ]

    return (
      <div>
        <h2 className={styles.chartTitle}>Block Statistics</h2>
        <ResponsiveContainer height={300} width="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis
              label={{
                value: `number of blocks`,
                style: { textAnchor: 'middle' },
                angle: -90,
                position: 'left',
                offset: 0,
              }}
            />
            <Tooltip content={<CustomTooltip {...{ resolvedTheme }} />} />{' '}
            <Legend />
            <Bar dataKey="blocks" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderPieChart = () => {
    const totalRewardsETH = toFixedNoTrailingZeros(
      weiToEth(stats?.totalRewardsSentWei),
      4
    )
    const donationsETH = toFixedNoTrailingZeros(
      weiToEth(stats?.totalDonationsWei),
      4
    )
    const blockRewardsETH = toFixedNoTrailingZeros(
      totalRewardsETH - donationsETH,
      4
    )

    const data = [
      { name: 'Donations', value: donationsETH },
      { name: 'Block Rewards', value: blockRewardsETH },
    ]

    const COLORS = ['#0088FE', '#00C49F']

    return (
      <div>
        <h2 className={styles.chartTitle}>Rewards Distribution</h2>
        <ResponsiveContainer height={300} width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey="value"
              fill="#8884d8"
              nameKey="name"
              outerRadius={100}>
              {data.map((entry) => (
                <Cell
                  key={entry.name} // Use a unique identifier (name) as the key
                  fill={COLORS[data.indexOf(entry) % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip {...{ resolvedTheme }} />} />{' '}
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderRewardsLast7DaysChart = () => {
    if (!proposedBlocks) return null // Return early if proposedBlocks is not available
    const now = new Date()
    const dateLabels = Array.from({ length: 7 }).map((_, index) => {
      // Calculate the date for each of the last 7 days, including today
      const day = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (6 - index)
      )
      return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(day)
    })

    const rewardsPerDay = Array.from({ length: 7 }, () => 0) // Initialize array for 7 days
    proposedBlocks.forEach((block) => {
      const blockTime = getSlotUnixTime(block.slot)
      const blockDate = new Date(blockTime * 1000)
      const blockLabel = new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(blockDate)

      const dayIndex = dateLabels.indexOf(blockLabel)
      if (dayIndex !== -1) {
        // Only add rewards for the last 7 days
        rewardsPerDay[dayIndex] += weiToEth(block.rewardWei)
      }
    })

    const formattedData = rewardsPerDay.map((reward, index) => ({
      day: dateLabels[index], // Use the calculated date label
      reward: toFixedNoTrailingZeros(reward, 4),
    }))

    return (
      <div>
        <h2 className={styles.chartTitle}>Rewards Last 7 Days</h2>
        <ResponsiveContainer height={400} width="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip content={<CustomTooltip {...{ resolvedTheme }} />} />{' '}
            <Legend />
            <Bar dataKey="reward" fill="#82ca9d" name="ETH" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderTopBlocksLast7DaysChart = () => {
    // Calculate top blocks directly here
    const now = new Date()
    const sevenDaysAgo =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime() /
      1000

    const last7DaysBlocks = proposedBlocks
      ?.filter((block) => getSlotUnixTime(block.slot) >= sevenDaysAgo)
      .map((block) => ({
        ...block,
        rewardEth: weiToEth(block.rewardWei),
      }))
      .sort((a, b) => b.rewardEth - a.rewardEth) // Sort blocks by reward in descending order
      .slice(0, 10) // Keep only top 10

    const formattedBlocks = last7DaysBlocks?.map((block) => ({
      name: `${block.block}`, // Assuming `block.number` holds the block number
      reward: toFixedNoTrailingZeros(block.rewardEth, 4),
      blockNumber: block.block, // Store the actual block number for redirection
    }))

    // This function is called when a bar is clicked.
    const handleBarClick = (data: { blockNumber: number }) => {
      // Ensure data.blockNumber is correctly populated.
      if (data.blockNumber) {
        window.open(`https://beaconcha.in/block/${data.blockNumber}`, '_blank')
      }
    }

    return (
      <div>
        <h2 className={styles.chartTitle}>Top 10 Blocks Last 7 Days</h2>
        <ResponsiveContainer height={400} width="100%">
          <BarChart
            data={formattedBlocks}
            layout="vertical" // For horizontal bars
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              style={{ cursor: 'pointer' }}
              tick={{ fontSize: 10 }}
              type="category"
            />
            <Tooltip content={<CustomTooltip {...{ resolvedTheme }} />} />{' '}
            <Legend />
            <Bar
              dataKey="reward"
              fill="#82ca9d"
              name="ETH Reward"
              style={{ cursor: 'pointer' }}
              onClick={handleBarClick}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderRewardDistributionChart = () => {
    // Define reward value buckets
    const rewardValueBuckets = [
      { range: '> 10 ETH', min: 10, max: Infinity },
      { range: '10 - 1 ETH', min: 1, max: 10 },
      { range: '1 - 0.5 ETH', min: 0.5, max: 1 },
      { range: '0.5 - 0.1 ETH', min: 0.1, max: 0.5 },
      { range: '< 0.1 ETH', min: 0, max: 0.1 },
    ]

    // Initialize counts and sums for each bucket
    const bucketCounts = rewardValueBuckets.map(() => 0)
    const bucketSums = rewardValueBuckets.map(() => 0)

    if (!proposedBlocks) {
      return null // Render nothing if proposedBlocks is undefined
    }

    // Categorize blocks into buckets and calculate the sum of rewards for each bucket
    proposedBlocks.forEach((block) => {
      const rewardEth = weiToEth(block.rewardWei)
      for (let i = 0; i < rewardValueBuckets.length; i += 1) {
        const { min, max } = rewardValueBuckets[i]
        if (rewardEth >= min && rewardEth <= max) {
          bucketCounts[i] += 1
          bucketSums[i] += rewardEth // Accumulate sum within the range
          break
        }
      }
    })

    // Prepare data for Scatter graph
    const data = rewardValueBuckets.map((bucket, index) => ({
      range: bucket.range,
      blocks: bucketCounts[index],
      sum: toFixedNoTrailingZeros(bucketSums[index], 4), // Round the sum within each range
    }))
    // Determine the maximum sum to set the domain of the right Y-axis
    const maxSum = Math.max(...bucketSums)

    return (
      <div>
        <h2 className={styles.chartTitle}>
          Proposed MEV Block Distribution by Ranges
        </h2>
        <ResponsiveContainer height={350} width="100%">
          <ComposedChart
            data={data}
            margin={{
              bottom: 25,
              left: 5,
            }}>
            <XAxis
              dataKey="range"
              dy={5}
              label={{
                value: `MEV reward range`,
                style: { textAnchor: 'middle' },
                position: 'bottom',
                offset: 8,
              }}
            />
            <YAxis
              yAxisId="left"
              label={{
                value: `number of blocks`,
                style: { textAnchor: 'middle' },
                angle: -90,
                position: 'left',
                offset: 0,
              }}
            />
            <YAxis
              domain={[0, Math.ceil(maxSum)]}
              orientation="right"
              stroke="#ff7300"
              tickFormatter={(value) => `${value} `}
              yAxisId="right"
              label={{
                value: `total ETH`,
                style: { textAnchor: 'middle' },
                angle: -90,
                position: 'right',
                offset: -10,
              }}
            />
            <Tooltip content={<CustomTooltip {...{ resolvedTheme }} />} />{' '}
            {/* <Legend /> */}
            <Bar dataKey="blocks" fill="#8884d8" yAxisId="left" />
            {/* <Scatter dataKey="sum" fill="red" yAxisId="right" /> */}
            <ReferenceLine label="Max" stroke="red" y={9800} yAxisId="right" />
            <Line
              dataKey="sum"
              stroke="#ff7300"
              type="monotone"
              yAxisId="right"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (isLoadingStats || isLoadingProposedBlocks) return <div>Loading...</div>

  return (
    <div
      className={`${styles.statsContainer} ${
        resolvedTheme === 'dark' ? styles.dark : ''
      }`}>
      <div className={styles.row}>
        <div className={styles.column}>{renderBarChart()}</div>
        <div className={styles.column}>{renderPieChart()}</div>
      </div>
      <div className={styles.row}>
        <div className={styles.column}>{renderRewardsLast7DaysChart()}</div>
        <div className={styles.column}>{renderTopBlocksLast7DaysChart()}</div>
      </div>
      <div
        className={`${styles.fullWidthGraph} ${
          resolvedTheme === 'dark' ? styles.dark : ''
        }`}>
        {renderRewardDistributionChart()}
      </div>
    </div>
  )
}
