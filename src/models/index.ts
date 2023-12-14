type U32 = number;
type U16 = number;
type Address = string;
type Balance = U32;
type Percentage = number; // Percentage value between 0 and 1

export type TaskIndex = number;

export type Timeslice = U32;
export type CoreIndex = U16;
export type CoreMask = Uint8Array; // 80 bits
export type RawRegionId = Uint8Array; // 128 bits

export type RegionId = {
  begin: Timeslice;
  core: CoreIndex;
  mask: CoreMask;
};

export type RegionRecord = {
  end: Timeslice;
  owner: Address;
  paid?: Balance;
};

export type RegionMetadata = RegionId &
  RegionRecord & {
    id: number;
    length: Timeslice;
    name?: string;
    ownership: Percentage;
    consumed: Percentage;
    task?: TaskMetadata;
  };

export type TaskMetadata = {
  taskId: TaskIndex;
  usage: Percentage;
  name?: string;
};
