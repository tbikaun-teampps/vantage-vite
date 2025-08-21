import { shared_role_name_to_id } from "../shared_roles";
import type { Company } from "./types";

export const company: Company = {
  id: "demo-company-1",
  name: "Vantage Resources",
  code: "VAR",
  description:
    "Leading Australian mining company specialising in iron ore and coal extraction with operations across Western Australia, New South Wales and Queensland. Committed to sustainable mining practices and safety excellence.",
  contacts: [
    {
      id: "demo-company-1-contact-1",
      fullname: "Michael Harrison",
      email: "michael.harrison@vr.com.au",
      title: "CEO",
    },
    {
      id: "demo-company-1-contact-2",
      fullname: "Geralt Witcher",
      email: "geralt.witcher@vr.com.au",
      title: "CFO",
    },
  ],
  business_units: [
    {
      id: "demo-business-unit-1",
      name: "Iron Ore Operations",
      code: "IRON",
      description:
        "Australia's premier iron ore division producing high-grade hematite and magnetite ore for global steel markets, with annual production capacity exceeding 200 million tonnes.",
      contacts: [
        {
          id: "demo-business-unit-1-contact-1",
          fullname: "Sarah Mitchell",
          email: "sarah.mitchell@vr.com.au",
          title: "Business Unit Manager",
        },
      ],
      regions: [
        {
          id: "demo-region-1",
          name: "Pilbara Region",
          code: "PILB",
          description:
            "Core iron ore production hub in Western Australia's Pilbara region, operating multiple world-class mines and integrated rail and port infrastructure.",
          contacts: [
            {
              id: "demo-region-1-contact-1",
              fullname: "James Thompson",
              email: "james.thompson@vr.com.au",
              title: "Region Manager",
            },
          ],
          sites: [
            {
              id: "demo-site-1",
              name: "Newman Mine",
              code: "NEW",
              description:
                "Flagship open-pit iron ore mine producing 40 million tonnes per annum of high-grade hematite ore with integrated processing and rail loading facilities.",
              lat: -23.3594,
              lng: 119.7332,
              contacts: [
                {
                  id: "demo-site-1-contact-1",
                  fullname: "Robert Chen",
                  email: "robert.chen@vr.com.au",
                  title: "Site Manager",
                },
              ],
              asset_groups: [
                {
                  id: "demo-asset-group-1",
                  name: "Heavy Equipment Fleet",
                  code: "HEF-1",
                  description:
                    "Fleet of 50+ ultra-class haul trucks, excavators, and dozers maintained through comprehensive preventive maintenance program.",
                  contacts: [
                    {
                      id: "demo-asset-group-1-contact-1",
                      fullname: "Marcus Brown",
                      email: "marcus.brown@vr.com.au",
                      title: "HME Fleet Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-1",
                      name: "Planning",
                      code: "PLN-01",
                      description:
                        "Planning and scheduling of maintenance activities for the heavy equipment fleet.",
                      contacts: [
                        {
                          id: "demo-work-group-1-contact-1",
                          fullname: "Nathan Brooks",
                          email: "nathan.brooks@vr.com.au",
                          title: "Field Service Technician",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-1",
                          shared_role_id:
                            shared_role_name_to_id[
                              "Planning and Reliability Superintendent"
                            ],
                          level: "management",
                          contacts: [
                            {
                              id: "demo-role-1-contact-1",
                              fullname: "David Anderson",
                              email: "david.anderson@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-1-1",
                              shared_role_id: shared_role_name_to_id["Planner"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-1-1-contact-1",
                                  fullname: "Emma Wilson",
                                  email: "emma.wilson@vr.com.au",
                                },
                                {
                                  id: "demo-role-1-1-contact-2",
                                  fullname: "Thomas Clarke",
                                  email: "thomas.clarke@vr.com.au",
                                },
                                {
                                  id: "demo-role-1-1-contact-3",
                                  fullname: "Jessica Roberts",
                                  email: "jessica.roberts@vr.com.au",
                                },
                              ],
                            },
                            {
                              id: "demo-role-1-2",
                              shared_role_id:
                                shared_role_name_to_id["Scheduler"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-1-2-contact-1",
                                  fullname: "Oliver Martinez",
                                  email: "oliver.martinez@vr.com.au",
                                },
                                {
                                  id: "demo-role-1-2-contact-2",
                                  fullname: "Rachel Thompson",
                                  email: "rachel.thompson@vr.com.au",
                                },
                                {
                                  id: "demo-role-1-2-contact-3",
                                  fullname: "Daniel Park",
                                  email: "daniel.park@vr.com.au",
                                },
                              ],
                            },
                            {
                              id: "demo-role-1-3",
                              shared_role_id:
                                shared_role_name_to_id["Reliability Engineer"],
                              level: "specialist",
                              contacts: [
                                {
                                  id: "demo-role-1-3-contact-1",
                                  fullname: "Madeleine Bartlett",
                                  email: "madeleine.bartlett@vr.com.au",
                                },
                                {
                                  id: "demo-role-1-3-contact-2",
                                  fullname: "Buford Baldwin",
                                  email: "buford.baldwin@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                        {
                          id: "demo-role-2",
                          shared_role_id:
                            shared_role_name_to_id[
                              "Maintenance Superintendent"
                            ],
                          level: "management",
                          contacts: [
                            {
                              id: "demo-role-2-contact-1",
                              fullname: "Sophie Taylor",
                              email: "sophie.taylor@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-2-1",
                              shared_role_id:
                                shared_role_name_to_id[
                                  "Maintenance Technician"
                                ],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-2-1-contact-1",
                                  fullname: "Lucas Johnson",
                                  email: "lucas.johnson@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "demo-site-3",
              name: "Tom Price Mine",
              code: "TOM",
              description:
                "High-grade iron ore mine in the Pilbara region producing premium hematite ore with modern open-pit operations and integrated rail infrastructure.",
              lat: -22.6957,
              lng: 117.7897,
              contacts: [
                {
                  id: "demo-site-3-contact-1",
                  fullname: "Rebecca Johnson",
                  email: "rebecca.johnson@vr.com.au",
                  title: "Site Manager",
                },
              ],
              asset_groups: [
                {
                  id: "demo-asset-group-4",
                  name: "Open Pit Operations",
                  code: "PIT-B",
                  description:
                    "Advanced open-pit mining operations utilizing autonomous haul trucks and precision drilling systems for efficient ore extraction.",
                  contacts: [
                    {
                      id: "demo-asset-group-4-contact-1",
                      fullname: "Timothy Walsh",
                      email: "timothy.walsh@vr.com.au",
                      title: "Pit Operations Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-4",
                      name: "Mining",
                      code: "MIN-03",
                      description:
                        "24/7 open-pit mining operations including drilling, blasting, loading, and hauling of iron ore.",
                      contacts: [
                        {
                          id: "demo-work-group-4-contact-1",
                          fullname: "Amanda Foster",
                          email: "amanda.foster@vr.com.au",
                          title: "Mining Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-5",
                          shared_role_id:
                            shared_role_name_to_id["Operations Superintendent"],
                          level: "management",
                          contacts: [
                            {
                              id: "demo-role-5-contact-1",
                              fullname: "Gregory Stone",
                              email: "gregory.stone@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-5-1",
                              shared_role_id:
                                shared_role_name_to_id["Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-5-1-contact-1",
                                  fullname: "Mark Stevens",
                                  email: "mark.stevens@vr.com.au",
                                },
                                {
                                  id: "demo-role-5-1-contact-2",
                                  fullname: "Lisa Campbell",
                                  email: "lisa.campbell@vr.com.au",
                                },
                              ],
                            },
                            {
                              id: "demo-role-5-2",
                              shared_role_id:
                                shared_role_name_to_id["Mechanical Engineer"],
                              level: "specialist",
                              contacts: [
                                {
                                  id: "demo-role-5-2-contact-1",
                                  fullname: "Carlos Rodriguez",
                                  email: "carlos.rodriguez@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "demo-asset-group-5",
                  name: "Rail Loading Facility",
                  code: "RLF-1",
                  description:
                    "High-capacity rail loading infrastructure for efficient transport of iron ore to port facilities with automated loading systems.",
                  contacts: [
                    {
                      id: "demo-asset-group-5-contact-1",
                      fullname: "Helen Parker",
                      email: "helen.parker@vr.com.au",
                      title: "Rail Operations Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-5",
                      name: "Rail Operations",
                      code: "RLO-01",
                      description:
                        "Coordination of rail loading operations, train scheduling, and maintenance of rail infrastructure systems.",
                      contacts: [
                        {
                          id: "demo-work-group-5-contact-1",
                          fullname: "Paul Harrison",
                          email: "paul.harrison@vr.com.au",
                          title: "Rail Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-6",
                          shared_role_id:
                            shared_role_name_to_id["Materials Coordinator"],
                          level: "specialist",
                          contacts: [
                            {
                              id: "demo-role-6-contact-1",
                              fullname: "Michelle Turner",
                              email: "michelle.turner@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-6-1",
                              shared_role_id:
                                shared_role_name_to_id["Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-6-1-contact-1",
                                  fullname: "Jason Miller",
                                  email: "jason.miller@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "demo-site-4",
              name: "Port Hedland Terminal",
              code: "PHT",
              description:
                "Major port facility for iron ore exports with ship loading terminals, stockyard operations, and automated cargo handling systems serving global markets.",
              lat: -20.3104,
              lng: 118.5741,
              contacts: [
                {
                  id: "demo-site-4-contact-1",
                  fullname: "Daniel Morrison",
                  email: "daniel.morrison@vr.com.au",
                  title: "Terminal Manager",
                },
              ],
              asset_groups: [
                {
                  id: "demo-asset-group-6",
                  name: "Ship Loading Terminal",
                  code: "SLT-1",
                  description:
                    "High-capacity ship loading infrastructure with automated stackers and reclaimers for efficient bulk iron ore export operations.",
                  contacts: [
                    {
                      id: "demo-asset-group-6-contact-1",
                      fullname: "Susan Richards",
                      email: "susan.richards@vr.com.au",
                      title: "Loading Operations Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-6",
                      name: "Ship Loading",
                      code: "SHL-01",
                      description:
                        "24/7 ship loading operations including berth management, cargo handling, and vessel coordination.",
                      contacts: [
                        {
                          id: "demo-work-group-6-contact-1",
                          fullname: "Michael O'Connor",
                          email: "michael.oconnor@vr.com.au",
                          title: "Ship Loading Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-7",
                          shared_role_id:
                            shared_role_name_to_id["Operations Supervisor"],
                          level: "management",
                          contacts: [
                            {
                              id: "demo-role-7-contact-1",
                              fullname: "Catherine Walsh",
                              email: "catherine.walsh@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-7-1",
                              shared_role_id: shared_role_name_to_id["Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-7-1-contact-1",
                                  fullname: "Peter Davies",
                                  email: "peter.davies@vr.com.au",
                                },
                                {
                                  id: "demo-role-7-1-contact-2",
                                  fullname: "Nicole Thompson",
                                  email: "nicole.thompson@vr.com.au",
                                },
                              ],
                            },
                            {
                              id: "demo-role-7-2",
                              shared_role_id:
                                shared_role_name_to_id["Maintenance Technician"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-7-2-contact-1",
                                  fullname: "Robert Kim",
                                  email: "robert.kim@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "demo-asset-group-7",
                  name: "Stockyard Operations",
                  code: "STY-1",
                  description:
                    "Large-scale stockyard facility for iron ore storage and blending operations with automated stacking and reclaiming equipment.",
                  contacts: [
                    {
                      id: "demo-asset-group-7-contact-1",
                      fullname: "Anthony Green",
                      email: "anthony.green@vr.com.au",
                      title: "Stockyard Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-7",
                      name: "Stockpile Management",
                      code: "STK-01",
                      description:
                        "Management of iron ore stockpiles including blending, quality control, and inventory tracking.",
                      contacts: [
                        {
                          id: "demo-work-group-7-contact-1",
                          fullname: "Jennifer Lee",
                          email: "jennifer.lee@vr.com.au",
                          title: "Stockpile Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-8",
                          shared_role_id:
                            shared_role_name_to_id["Quality Inspector"],
                          level: "specialist",
                          contacts: [
                            {
                              id: "demo-role-8-contact-1",
                              fullname: "David Chen",
                              email: "david.chen@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-8-1",
                              shared_role_id: shared_role_name_to_id["Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-8-1-contact-1",
                                  fullname: "Angela Martinez",
                                  email: "angela.martinez@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "demo-region-3",
          name: "Kimberley Region",
          code: "KIMB",
          description:
            "Remote iron ore mining region in Western Australia's Kimberley area, featuring unique island-based operations and specialized marine logistics infrastructure.",
          contacts: [
            {
              id: "demo-region-3-contact-1",
              fullname: "Elizabeth Carter",
              email: "elizabeth.carter@vr.com.au",
              title: "Region Manager",
            },
          ],
          sites: [
            {
              id: "demo-site-5",
              name: "Koolan Island Mine",
              code: "KOO",
              description:
                "Unique island-based iron ore mining operation in the Kimberley region with specialized marine operations and onsite processing facilities.",
              lat: -16.1333,
              lng: 123.75,
              contacts: [
                {
                  id: "demo-site-5-contact-1",
                  fullname: "William Baker",
                  email: "william.baker@vr.com.au",
                  title: "Site Manager",
                },
              ],
              asset_groups: [
                {
                  id: "demo-asset-group-8",
                  name: "Marine Operations",
                  code: "MAR-1",
                  description:
                    "Specialized marine logistics operations including barge loading, vessel coordination, and port facility management for island-based mining operations.",
                  contacts: [
                    {
                      id: "demo-asset-group-8-contact-1",
                      fullname: "Christopher White",
                      email: "christopher.white@vr.com.au",
                      title: "Marine Operations Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-8",
                      name: "Marine Logistics",
                      code: "MAL-01",
                      description:
                        "Coordination of marine transport operations, vessel scheduling, and cargo handling for remote island operations.",
                      contacts: [
                        {
                          id: "demo-work-group-8-contact-1",
                          fullname: "Sarah O'Brien",
                          email: "sarah.obrien@vr.com.au",
                          title: "Marine Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-9",
                          shared_role_id:
                            shared_role_name_to_id["Operations Supervisor"],
                          level: "management",
                          contacts: [
                            {
                              id: "demo-role-9-contact-1",
                              fullname: "Matthew Robinson",
                              email: "matthew.robinson@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-9-1",
                              shared_role_id: shared_role_name_to_id["Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-9-1-contact-1",
                                  fullname: "Lisa Anderson",
                                  email: "lisa.anderson@vr.com.au",
                                },
                                {
                                  id: "demo-role-9-1-contact-2",
                                  fullname: "Thomas Wright",
                                  email: "thomas.wright@vr.com.au",
                                },
                              ],
                            },
                            {
                              id: "demo-role-9-2",
                              shared_role_id:
                                shared_role_name_to_id["Materials Coordinator"],
                              level: "specialist",
                              contacts: [
                                {
                                  id: "demo-role-9-2-contact-1",
                                  fullname: "Karen Phillips",
                                  email: "karen.phillips@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "demo-asset-group-9",
                  name: "Crusher Plant",
                  code: "CRU-1",
                  description:
                    "Onsite crushing and processing facility for iron ore beneficiation with screening, crushing, and size classification equipment.",
                  contacts: [
                    {
                      id: "demo-asset-group-9-contact-1",
                      fullname: "Victoria Hughes",
                      email: "victoria.hughes@vr.com.au",
                      title: "Plant Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-9",
                      name: "Processing Operations",
                      code: "PRO-02",
                      description:
                        "Crushing and screening operations for iron ore processing including equipment operation and maintenance coordination.",
                      contacts: [
                        {
                          id: "demo-work-group-9-contact-1",
                          fullname: "James Collins",
                          email: "james.collins@vr.com.au",
                          title: "Processing Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-10",
                          shared_role_id:
                            shared_role_name_to_id["Process Engineer"],
                          level: "specialist",
                          contacts: [
                            {
                              id: "demo-role-10-contact-1",
                              fullname: "Rachel Murphy",
                              email: "rachel.murphy@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-10-1",
                              shared_role_id:
                                shared_role_name_to_id["Process Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-10-1-contact-1",
                                  fullname: "Brian Cooper",
                                  email: "brian.cooper@vr.com.au",
                                },
                                {
                                  id: "demo-role-10-1-contact-2",
                                  fullname: "Sandra Bell",
                                  email: "sandra.bell@vr.com.au",
                                },
                              ],
                            },
                            {
                              id: "demo-role-10-2",
                              shared_role_id:
                                shared_role_name_to_id["Maintenance Technician"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-10-2-contact-1",
                                  fullname: "Gary Stewart",
                                  email: "gary.stewart@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "demo-business-unit-2",
      name: "Coal Operations",
      code: "COAL",
      description:
        "Comprehensive coal mining operations across Australia's premier coal basins, producing high-quality metallurgical and thermal coal for domestic and export markets with annual production exceeding 30 million tonnes.",
      contacts: [
        {
          id: "demo-business-unit-2-contact-1",
          fullname: "Michael Thompson",
          email: "michael.thompson@vr.com.au",
          title: "Business Unit Manager",
        },
      ],
      regions: [
        {
          id: "demo-region-2",
          name: "Hunter Valley",
          code: "HUNT",
          description:
            "Australia's premier coal mining region in New South Wales, known for world-class metallurgical coal deposits and advanced mining infrastructure supporting both domestic and export markets.",
          contacts: [
            {
              id: "demo-region-2-contact-1",
              fullname: "Andrew Davis",
              email: "andrew.davis@vr.com.au",
              title: "Region Manager",
            },
          ],
          sites: [
            {
              id: "demo-site-2",
              name: "Mount Arthur Mine",
              code: "MAR",
              description:
                "Large-scale open-cut coal mine in the Hunter Valley producing premium metallurgical coal with dragline operations and integrated coal handling facilities.",
              lat: -32.3458,
              lng: 150.8969,
              contacts: [
                {
                  id: "demo-site-2-contact-1",
                  fullname: "Patricia Wilson",
                  email: "patricia.wilson@vr.com.au",
                  title: "Site Manager",
                },
              ],
              asset_groups: [
                {
                  id: "demo-asset-group-2",
                  name: "Dragline Operations",
                  code: "DRG-1",
                  description:
                    "State-of-the-art dragline fleet for overburden removal and coal extraction operations with advanced automation and monitoring systems.",
                  contacts: [
                    {
                      id: "demo-asset-group-2-contact-1",
                      fullname: "Christopher Lee",
                      email: "christopher.lee@vr.com.au",
                      title: "Dragline Operations Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-2",
                      name: "Operations",
                      code: "OPS-02",
                      description:
                        "24/7 dragline operations including equipment operation, maintenance coordination, and production optimization.",
                      contacts: [
                        {
                          id: "demo-work-group-2-contact-1",
                          fullname: "Ryan Mitchell",
                          email: "ryan.mitchell@vr.com.au",
                          title: "Operations Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-3",
                          shared_role_id:
                            shared_role_name_to_id["Operations Superintendent"],
                          level: "management",
                          contacts: [
                            {
                              id: "demo-role-3-contact-1",
                              fullname: "Maria Garcia",
                              email: "maria.garcia@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-3-1",
                              shared_role_id:
                                shared_role_name_to_id["Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-3-1-contact-1",
                                  fullname: "Benjamin Turner",
                                  email: "benjamin.turner@vr.com.au",
                                },
                                {
                                  id: "demo-role-3-1-contact-2",
                                  fullname: "Sarah Connor",
                                  email: "sarah.connor@vr.com.au",
                                },
                              ],
                            },
                            {
                              id: "demo-role-3-2",
                              shared_role_id:
                                shared_role_name_to_id[
                                  "Maintenance Technician"
                                ],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-3-2-contact-1",
                                  fullname: "Kevin Brown",
                                  email: "kevin.brown@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "demo-asset-group-3",
                  name: "Coal Handling Plant",
                  code: "CHP-1",
                  description:
                    "Advanced coal processing facility with washing, screening, and loading systems designed for high-quality metallurgical coal production.",
                  contacts: [
                    {
                      id: "demo-asset-group-3-contact-1",
                      fullname: "Jennifer Adams",
                      email: "jennifer.adams@vr.com.au",
                      title: "Plant Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-3",
                      name: "Processing",
                      code: "PRC-01",
                      description:
                        "Coal washing, screening, and quality control operations to produce export-grade metallurgical coal.",
                      contacts: [
                        {
                          id: "demo-work-group-3-contact-1",
                          fullname: "Steven Walsh",
                          email: "steven.walsh@vr.com.au",
                          title: "Processing Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-4",
                          shared_role_id:
                            shared_role_name_to_id["Process Engineer"],
                          level: "specialist",
                          contacts: [
                            {
                              id: "demo-role-4-contact-1",
                              fullname: "Laura Peterson",
                              email: "laura.peterson@vr.com.au",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "demo-site-6",
              name: "Bengalla Mine",
              code: "BEN",
              description:
                "Open-cut coal mine in the Hunter Valley producing high-quality thermal coal with advanced washery facilities and environmental management systems.",
              lat: -32.2583,
              lng: 150.8639,
              contacts: [
                {
                  id: "demo-site-6-contact-1",
                  fullname: "Margaret Thompson",
                  email: "margaret.thompson@vr.com.au",
                  title: "Site Manager",
                },
              ],
              asset_groups: [
                {
                  id: "demo-asset-group-10",
                  name: "Open Cut Operations",
                  code: "OCO-1",
                  description:
                    "Large-scale open-cut mining operations with truck and shovel fleet for thermal coal extraction and overburden management.",
                  contacts: [
                    {
                      id: "demo-asset-group-10-contact-1",
                      fullname: "Robert Jackson",
                      email: "robert.jackson@vr.com.au",
                      title: "Mining Operations Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-10",
                      name: "Mining Operations",
                      code: "MIN-04",
                      description:
                        "Open-cut mining operations including drilling, blasting, excavation, and haulage of coal and overburden materials.",
                      contacts: [
                        {
                          id: "demo-work-group-10-contact-1",
                          fullname: "Daniel Rodriguez",
                          email: "daniel.rodriguez@vr.com.au",
                          title: "Mining Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-11",
                          shared_role_id:
                            shared_role_name_to_id["Operations Superintendent"],
                          level: "management",
                          contacts: [
                            {
                              id: "demo-role-11-contact-1",
                              fullname: "Amanda Foster",
                              email: "amanda.foster@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-11-1",
                              shared_role_id: shared_role_name_to_id["Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-11-1-contact-1",
                                  fullname: "Jason Miller",
                                  email: "jason.miller@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "demo-asset-group-11",
                  name: "Washery Plant",
                  code: "WSH-1",
                  description:
                    "Coal washing and preparation plant for thermal coal beneficiation with dense medium separation and flotation circuits.",
                  contacts: [
                    {
                      id: "demo-asset-group-11-contact-1",
                      fullname: "Emily Watson",
                      email: "emily.watson@vr.com.au",
                      title: "Washery Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-11",
                      name: "Coal Preparation",
                      code: "CPP-01",
                      description:
                        "Coal washing and preparation operations including dense medium separation, flotation, and product handling systems.",
                      contacts: [
                        {
                          id: "demo-work-group-11-contact-1",
                          fullname: "Stephen Clark",
                          email: "stephen.clark@vr.com.au",
                          title: "Preparation Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-12",
                          shared_role_id:
                            shared_role_name_to_id["Process Engineer"],
                          level: "specialist",
                          contacts: [
                            {
                              id: "demo-role-12-contact-1",
                              fullname: "Linda Martinez",
                              email: "linda.martinez@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-12-1",
                              shared_role_id:
                                shared_role_name_to_id["Process Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-12-1-contact-1",
                                  fullname: "Michael Lewis",
                                  email: "michael.lewis@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "demo-region-4",
          name: "Bowen Basin",
          code: "BOWN",
          description:
            "Premier metallurgical coal mining region in Queensland, known for high-quality coking coal deposits and underground mining operations serving global steel markets.",
          contacts: [
            {
              id: "demo-region-4-contact-1",
              fullname: "Christopher Evans",
              email: "christopher.evans@vr.com.au",
              title: "Region Manager",
            },
          ],
          sites: [
            {
              id: "demo-site-7",
              name: "Peak Downs Mine",
              code: "PEA",
              description:
                "Underground metallurgical coal mine in the Bowen Basin producing premium coking coal with longwall mining systems and comprehensive ventilation infrastructure.",
              lat: -22.25,
              lng: 148.1833,
              contacts: [
                {
                  id: "demo-site-7-contact-1",
                  fullname: "Nathan Brooks",
                  email: "nathan.brooks@vr.com.au",
                  title: "Site Manager",
                },
              ],
              asset_groups: [
                {
                  id: "demo-asset-group-12",
                  name: "Underground Operations",
                  code: "UND-1",
                  description:
                    "Underground longwall mining operations with continuous miners, shuttle cars, and belt conveyor systems for coking coal extraction.",
                  contacts: [
                    {
                      id: "demo-asset-group-12-contact-1",
                      fullname: "Graham Wilson",
                      email: "graham.wilson@vr.com.au",
                      title: "Underground Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-12",
                      name: "Longwall Operations",
                      code: "LWO-01",
                      description:
                        "Longwall mining operations including shearer operation, face support management, and coal transport systems.",
                      contacts: [
                        {
                          id: "demo-work-group-12-contact-1",
                          fullname: "Bradley Smith",
                          email: "bradley.smith@vr.com.au",
                          title: "Longwall Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-13",
                          shared_role_id:
                            shared_role_name_to_id["Operations Supervisor"],
                          level: "management",
                          contacts: [
                            {
                              id: "demo-role-13-contact-1",
                              fullname: "Trevor Davis",
                              email: "trevor.davis@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-13-1",
                              shared_role_id: shared_role_name_to_id["Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-13-1-contact-1",
                                  fullname: "Shane Murphy",
                                  email: "shane.murphy@vr.com.au",
                                },
                                {
                                  id: "demo-role-13-1-contact-2",
                                  fullname: "Craig Thompson",
                                  email: "craig.thompson@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "demo-asset-group-13",
                  name: "Ventilation Systems",
                  code: "VEN-1",
                  description:
                    "Underground ventilation systems including main fans, auxiliary ventilation, and gas monitoring systems for safe underground operations.",
                  contacts: [
                    {
                      id: "demo-asset-group-13-contact-1",
                      fullname: "Peter Campbell",
                      email: "peter.campbell@vr.com.au",
                      title: "Ventilation Engineer",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-13",
                      name: "Ventilation Engineering",
                      code: "VEN-02",
                      description:
                        "Design, maintenance, and monitoring of underground ventilation systems and gas management programs.",
                      contacts: [
                        {
                          id: "demo-work-group-13-contact-1",
                          fullname: "Alan Roberts",
                          email: "alan.roberts@vr.com.au",
                          title: "Ventilation Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-14",
                          shared_role_id:
                            shared_role_name_to_id["Mechanical Engineer"],
                          level: "specialist",
                          contacts: [
                            {
                              id: "demo-role-14-contact-1",
                              fullname: "Simon Clarke",
                              email: "simon.clarke@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-14-1",
                              shared_role_id:
                                shared_role_name_to_id["Maintenance Technician"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-14-1-contact-1",
                                  fullname: "Wayne Johnson",
                                  email: "wayne.johnson@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "demo-site-8",
              name: "Goonyella Mine",
              code: "GOO",
              description:
                "Advanced underground metallurgical coal mine in the Bowen Basin with state-of-the-art longwall mining systems and comprehensive gas drainage infrastructure.",
              lat: -21.8667,
              lng: 147.95,
              contacts: [
                {
                  id: "demo-site-8-contact-1",
                  fullname: "Richard Taylor",
                  email: "richard.taylor@vr.com.au",
                  title: "Site Manager",
                },
              ],
              asset_groups: [
                {
                  id: "demo-asset-group-14",
                  name: "Longwall Mining",
                  code: "LWM-1",
                  description:
                    "Advanced longwall mining systems with automated shearers, hydraulic roof supports, and continuous haulage systems for high-volume coal extraction.",
                  contacts: [
                    {
                      id: "demo-asset-group-14-contact-1",
                      fullname: "Kevin Brown",
                      email: "kevin.brown@vr.com.au",
                      title: "Longwall Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-14",
                      name: "Production Operations",
                      code: "PRD-01",
                      description:
                        "24/7 longwall production operations including equipment operation, face management, and coal transport coordination.",
                      contacts: [
                        {
                          id: "demo-work-group-14-contact-1",
                          fullname: "Scott Williams",
                          email: "scott.williams@vr.com.au",
                          title: "Production Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-15",
                          shared_role_id:
                            shared_role_name_to_id["Operations Superintendent"],
                          level: "management",
                          contacts: [
                            {
                              id: "demo-role-15-contact-1",
                              fullname: "Mark Stevens",
                              email: "mark.stevens@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-15-1",
                              shared_role_id: shared_role_name_to_id["Operator"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-15-1-contact-1",
                                  fullname: "David Miller",
                                  email: "david.miller@vr.com.au",
                                },
                                {
                                  id: "demo-role-15-1-contact-2",
                                  fullname: "Paul Johnson",
                                  email: "paul.johnson@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "demo-asset-group-15",
                  name: "Gas Drainage Systems",
                  code: "GDS-1",
                  description:
                    "Comprehensive gas drainage and management systems including pre-drainage, post-drainage, and surface gas capture systems for safe mining operations.",
                  contacts: [
                    {
                      id: "demo-asset-group-15-contact-1",
                      fullname: "Michelle Turner",
                      email: "michelle.turner@vr.com.au",
                      title: "Gas Management Engineer",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-15",
                      name: "Gas Management",
                      code: "GAS-01",
                      description:
                        "Monitoring and management of mine gas systems including methane drainage, ventilation coordination, and gas utilization projects.",
                      contacts: [
                        {
                          id: "demo-work-group-15-contact-1",
                          fullname: "Anthony Green",
                          email: "anthony.green@vr.com.au",
                          title: "Gas Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-16",
                          shared_role_id:
                            shared_role_name_to_id["Environmental Officer"],
                          level: "specialist",
                          contacts: [
                            {
                              id: "demo-role-16-contact-1",
                              fullname: "Jennifer Lee",
                              email: "jennifer.lee@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-16-1",
                              shared_role_id:
                                shared_role_name_to_id["Instrumentation Technician"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-16-1-contact-1",
                                  fullname: "Robert Kim",
                                  email: "robert.kim@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "demo-business-unit-3",
      name: "Health Safety & Environment",
      code: "HSE",
      description:
        "Corporate health, safety, and environmental division responsible for safety standards, environmental compliance, emergency response training, and sustainability initiatives across all operations.",
      contacts: [
        {
          id: "demo-business-unit-3-contact-1",
          fullname: "Emma Williams",
          email: "emma.williams@vr.com.au",
          title: "Business Unit Manager",
        },
      ],
      regions: [
        {
          id: "demo-region-5",
          name: "Corporate HSE",
          code: "CHSE",
          description:
            "Central health, safety, and environmental services providing training, compliance oversight, and emergency response coordination for all company operations.",
          contacts: [
            {
              id: "demo-region-5-contact-1",
              fullname: "Marcus Brown",
              email: "marcus.brown@vr.com.au",
              title: "HSE Region Manager",
            },
          ],
          sites: [
            {
              id: "demo-site-9",
              name: "Perth Training Centre",
              code: "PTC",
              description:
                "Comprehensive training facility for safety, emergency response, and environmental programs serving all company operations with state-of-the-art simulation equipment.",
              lat: -31.9505,
              lng: 115.8605,
              contacts: [
                {
                  id: "demo-site-9-contact-1",
                  fullname: "Helen Parker",
                  email: "helen.parker@vr.com.au",
                  title: "Training Centre Manager",
                },
              ],
              asset_groups: [
                {
                  id: "demo-asset-group-16",
                  name: "Emergency Response Training",
                  code: "ERT-1",
                  description:
                    "Emergency response training facilities including fire simulation, rescue training equipment, and emergency response coordination systems.",
                  contacts: [
                    {
                      id: "demo-asset-group-16-contact-1",
                      fullname: "David Anderson",
                      email: "david.anderson@vr.com.au",
                      title: "Emergency Response Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-16",
                      name: "Emergency Training",
                      code: "EMT-01",
                      description:
                        "Design and delivery of emergency response training programs including fire fighting, rescue operations, and crisis management.",
                      contacts: [
                        {
                          id: "demo-work-group-16-contact-1",
                          fullname: "Sophie Taylor",
                          email: "sophie.taylor@vr.com.au",
                          title: "Emergency Training Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-17",
                          shared_role_id:
                            shared_role_name_to_id["Training Coordinator"],
                          level: "specialist",
                          contacts: [
                            {
                              id: "demo-role-17-contact-1",
                              fullname: "Emma Wilson",
                              email: "emma.wilson@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-17-1",
                              shared_role_id:
                                shared_role_name_to_id["Safety Officer"],
                              level: "specialist",
                              contacts: [
                                {
                                  id: "demo-role-17-1-contact-1",
                                  fullname: "Thomas Clarke",
                                  email: "thomas.clarke@vr.com.au",
                                },
                                {
                                  id: "demo-role-17-1-contact-2",
                                  fullname: "Jessica Roberts",
                                  email: "jessica.roberts@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "demo-asset-group-17",
                  name: "Safety Equipment Testing",
                  code: "SET-1",
                  description:
                    "Safety equipment testing and calibration facility for personal protective equipment, gas detection systems, and emergency response equipment.",
                  contacts: [
                    {
                      id: "demo-asset-group-17-contact-1",
                      fullname: "Oliver Martinez",
                      email: "oliver.martinez@vr.com.au",
                      title: "Equipment Testing Manager",
                    },
                  ],
                  work_groups: [
                    {
                      id: "demo-work-group-17",
                      name: "Equipment Certification",
                      code: "EQC-01",
                      description:
                        "Testing, calibration, and certification of safety equipment and systems to ensure compliance with safety standards and regulations.",
                      contacts: [
                        {
                          id: "demo-work-group-17-contact-1",
                          fullname: "Rachel Thompson",
                          email: "rachel.thompson@vr.com.au",
                          title: "Certification Supervisor",
                        },
                      ],
                      roles: [
                        {
                          id: "demo-role-18",
                          shared_role_id:
                            shared_role_name_to_id["Quality Inspector"],
                          level: "specialist",
                          contacts: [
                            {
                              id: "demo-role-18-contact-1",
                              fullname: "Daniel Park",
                              email: "daniel.park@vr.com.au",
                            },
                          ],
                          direct_reports: [
                            {
                              id: "demo-role-18-1",
                              shared_role_id:
                                shared_role_name_to_id["Instrumentation Technician"],
                              level: "technician",
                              contacts: [
                                {
                                  id: "demo-role-18-1-contact-1",
                                  fullname: "Madeleine Bartlett",
                                  email: "madeleine.bartlett@vr.com.au",
                                },
                                {
                                  id: "demo-role-18-1-contact-2",
                                  fullname: "Buford Baldwin",
                                  email: "buford.baldwin@vr.com.au",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
