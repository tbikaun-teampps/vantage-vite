import { shared_role_name_to_id } from "../shared_roles";

export const company = {
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
          ],
        },
      ],
    },
  ],
};
