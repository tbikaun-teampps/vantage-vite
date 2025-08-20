import { shared_role_name_to_id } from "../shared_roles";

export const company = {
  id: "demo-company-1",
  name: "Vantage Resources",
  code: "VAR",
  description:
    "Leading Australian mining company specialising in iron ore and coal extraction with operations across Western Australia, New South Wales and Queensland. Committed to sustainable mining practices and safety excellence.",
  contact_full_name: "Michael Harrison",
  contact_email: "michael.harrison@vr.com.au",
  business_units: [
    {
      id: "demo-business-unit-1",
      name: "Iron Ore Operations",
      code: "IRON",
      description:
        "Australia's premier iron ore division producing high-grade hematite and magnetite ore for global steel markets, with annual production capacity exceeding 200 million tonnes.",
      contact_full_name: "Sarah Mitchell",
      contact_email: "sarah.mitchell@vr.com.au",
      regions: [
        {
          id: "demo-region-1",
          name: "Pilbara Region",
          code: "PILB",
          description:
            "Core iron ore production hub in Western Australia's Pilbara region, operating multiple world-class mines and integrated rail and port infrastructure.",
          contact_full_name: "James Thompson",
          contact_email: "james.thompson@vr.com.au",
          sites: [
            {
              id: "demo-site-1",
              name: "Newman Mine",
              code: "NEW",
              description:
                "Flagship open-pit iron ore mine producing 40 million tonnes per annum of high-grade hematite ore with integrated processing and rail loading facilities.",
              contact_full_name: "Robert Chen",
              contact_email: "robert.chen@vr.com.au",
              lat: -23.3594,
              lng: 119.7332,
              asset_groups: [
                {
                  id: "demo-asset-group-1",
                  name: "Heavy Equipment Fleet",
                  code: "HEF-1",
                  description:
                    "Fleet of 50+ ultra-class haul trucks, excavators, and dozers maintained through comprehensive preventive maintenance program.",
                  contact_full_name: "Marcus Brown",
                  contact_email: "marcus.brown@vr.com.au",
                  work_groups: [
                    {
                      id: "demo-work-group-1",
                      name: "Field Service Team",
                      code: "FST-01",
                      description:
                        "Mobile maintenance unit providing 24/7 breakdown response, minor repairs, and scheduled servicing at equipment locations.",
                      contact_full_name: "Nathan Brooks",
                      contact_email: "nathan.brooks@vr.com.au",
                      roles: [
                        {
                          id: "demo-role-1",
                          shared_role_id: shared_role_name_to_id["Electrician"],
                          contact_full_name: "John Doe",
                          contact_email: "john.doe@vr.com.au",
                          level: "technician",
                        },
                        {
                          id: "demo-role-2",
                          shared_role_id:
                            shared_role_name_to_id["Maintenance Technician"],
                          contact_full_name: "Jane Smith",
                          contact_email: "jane.smith@vr.com.au",
                          level: "technician",
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
