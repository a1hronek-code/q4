import {
  getRpoSubject,
  hasRpoDatabase,
  searchRpo,
  type RpoSubject,
} from "./rpo";
import { getRpoSubjectRemote, searchRpoRemote } from "./rpo-remote";

export async function searchRpoAvailable(
  query: string,
  onlyActive: boolean,
): Promise<{ results: RpoSubject[]; total: number }> {
  return hasRpoDatabase()
    ? searchRpo(query, onlyActive)
    : searchRpoRemote(query, onlyActive);
}

export async function getRpoSubjectAvailable(id: number): Promise<RpoSubject | null> {
  return hasRpoDatabase() ? getRpoSubject(id) : getRpoSubjectRemote(id);
}
